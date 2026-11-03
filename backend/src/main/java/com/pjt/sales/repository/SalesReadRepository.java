package com.pjt.sales.repository;
import com.pjt.sales.service.SalesTableRegistry;
import com.pjt.sales.service.SalesRequestException;
import com.pjt.sales.service.SalesTableRegistry.Kind;
import com.pjt.sales.service.SalesTableRegistry.TableSpec;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
@Repository
public class SalesReadRepository {
    @PersistenceContext private EntityManager em;
    private final SalesTableRegistry registry;
    private final boolean h2;
    public SalesReadRepository(SalesTableRegistry registry,@Value("${app.sales.row-id-mode:oracle}") String mode) {
        this.registry=registry;
        if(!mode.equals("oracle")&&!mode.equals("h2")) throw new IllegalArgumentException("Unsupported row identity mode");
        this.h2=mode.equals("h2");
    }
    private String identity() { return h2 ? "CAST(_ROWID_ AS VARCHAR2(30))" : "ROWIDTOCHAR(ROWID)"; }
    private String identityOrder() { return h2 ? "_ROWID_" : "ROWID"; }
    private String identityWhere() { return h2 ? "_ROWID_ = CAST(:rowId AS BIGINT)" : "ROWID = CHARTOROWID(:rowId)"; }
    private String columns(TableSpec table) { return String.join(",",table.columns().stream().map(c->c.name()).toList()); }
    private String rawId(String token) {
        try {
            if(token==null||token.length()>80||!token.matches("[A-Za-z0-9_-]+")) throw new IllegalArgumentException();
            String value=new String(Base64.getUrlDecoder().decode(token),StandardCharsets.US_ASCII);
            if(!(h2 ? value.matches("[0-9]{1,20}") : value.matches("[A-Za-z0-9+/]{18}"))) throw new IllegalArgumentException();
            return value;
        } catch(IllegalArgumentException ex) { throw new SalesRequestException("행 식별자가 올바르지 않습니다. 목록을 다시 조회하세요."); }
    }
    private record Filter(String where,String pattern) {}
    private Filter filter(TableSpec table,String field,String keyword) {
        if(!field.equals("all")&&table.columns().stream().noneMatch(c->c.name().equals(field))) throw new SalesRequestException("허용되지 않는 검색 항목입니다.");
        if(keyword.isEmpty()) return new Filter("",null);
        String pattern="%"+keyword.toLowerCase(Locale.ROOT).replace("!","!!").replace("%","!%").replace("_","!_")+"%";
        List<String> expressions=new ArrayList<>();
        for(var column:table.columns()) {
            if(!field.equals("all")&&!column.name().equals(field)) continue;
            String expression=switch(column.kind()) {
                case TEXT -> column.name();
                case NUMBER -> "CAST("+column.name()+" AS VARCHAR2(100))";
                case DATE -> "TO_CHAR("+column.name()+",'YYYY-MM-DD HH24:MI:SS')";
            };
            expressions.add("LOWER("+expression+") LIKE :pattern ESCAPE '!' ");
        }
        return new Filter(" WHERE ("+String.join(" OR ",expressions)+")",pattern);
    }
    private Query bind(Query query,Filter filter) { if(filter.pattern()!=null) query.setParameter("pattern",filter.pattern()); return query; }
    public long count(String key,String field,String keyword) {
        var table=registry.table(key); var filter=filter(table,field,keyword);
        return ((Number)bind(em.createNativeQuery("SELECT COUNT(*) FROM "+table.name()+filter.where()),filter).getSingleResult()).longValue();
    }
    public List<Map<String,Object>> findPage(String key,int page,int size,String field,String keyword) {
        var table=registry.table(key); var filter=filter(table,field,keyword); String columns=columns(table);
        String sql="SELECT ROW_TOKEN,"+columns+" FROM (SELECT "+identity()+" AS ROW_TOKEN,"+columns+
            ",ROW_NUMBER() OVER(ORDER BY "+table.orderBy()+","+identityOrder()+") AS PAGE_ROW_NO FROM "+table.name()+filter.where()+
            ") WHERE PAGE_ROW_NO > :startRow AND PAGE_ROW_NO <= :endRow ORDER BY PAGE_ROW_NO";
        long start=(long)(page-1)*size;
        List<?> result=bind(em.createNativeQuery(sql),filter).setParameter("startRow",start).setParameter("endRow",start+size).getResultList();
        return result.stream().map(item->map(table,(Object[])item)).toList();
    }
    public Map<String,Object> find(String key,String id,boolean lock) {
        var table=registry.table(key);
        String sql="SELECT "+identity()+" AS ROW_TOKEN,"+columns(table)+" FROM "+table.name()+" WHERE "+identityWhere()+(lock ? " FOR UPDATE" : "");
        List<?> rows=em.createNativeQuery(sql).setParameter("rowId",rawId(id)).getResultList();
        if(rows.isEmpty()) throw new NoSuchElementException("데이터가 없습니다. 삭제되었거나 행 위치가 변경되었을 수 있습니다. 목록을 다시 조회하세요.");
        return map(table,(Object[])rows.get(0));
    }
    public void insert(String key,Map<String,Object> values) {
        var table=registry.table(key);
        String params=String.join(",",table.columns().stream().map(c->":"+c.name()).toList());
        Query query=em.createNativeQuery("INSERT INTO "+table.name()+" ("+columns(table)+") VALUES ("+params+")");
        bindValues(query,table,values).executeUpdate();
    }
    public int update(String key,String id,Map<String,Object> values) {
        var table=registry.table(key);
        String assignments=String.join(",",table.columns().stream().map(c->c.name()+"=:"+c.name()).toList());
        Query query=em.createNativeQuery("UPDATE "+table.name()+" SET "+assignments+" WHERE "+identityWhere()).setParameter("rowId",rawId(id));
        return bindValues(query,table,values).executeUpdate();
    }
    public int delete(String key,String id) {
        var table=registry.table(key);
        return em.createNativeQuery("DELETE FROM "+table.name()+" WHERE "+identityWhere()).setParameter("rowId",rawId(id)).executeUpdate();
    }
    private Query bindValues(Query query,TableSpec table,Map<String,Object> values) {
        // Explicit parameter types also allow clearing NUMBER/DATE columns to NULL with Oracle JDBC.
        var nativeQuery=query.unwrap(org.hibernate.query.NativeQuery.class);
        for(var column:table.columns()) {
            Object value=values.get(column.name());
            switch(column.kind()) {
                case NUMBER -> nativeQuery.setParameter(column.name(),(java.math.BigDecimal)value,java.math.BigDecimal.class);
                case DATE -> nativeQuery.setParameter(column.name(),(LocalDateTime)value,LocalDateTime.class);
                case TEXT -> nativeQuery.setParameter(column.name(),(String)value,String.class);
            }
        }
        return query;
    }
    private Map<String,Object> map(TableSpec table,Object[] raw) {
        Map<String,Object> row=new LinkedHashMap<>();
        String id=Base64.getUrlEncoder().withoutPadding().encodeToString(raw[0].toString().getBytes(StandardCharsets.US_ASCII));
        row.put("_rowId",id);
        for(int i=0;i<table.columns().size();i++) {
            Object value=raw[i+1];
            if(value instanceof Timestamp timestamp) value=timestamp.toLocalDateTime().toString();
            else if(value instanceof java.sql.Date date) value=date.toLocalDate().atStartOfDay().toString();
            else if(value instanceof LocalDateTime date) value=date.toString();
            row.put(table.columns().get(i).name(),value);
        }
        StringBuilder canonical=new StringBuilder(table.name()).append('|').append(id);
        for(var column:table.columns()) {
            Object value=row.get(column.name());
            String text=value==null ? null : value instanceof Number ? new java.math.BigDecimal(value.toString()).stripTrailingZeros().toPlainString() : value.toString();
            canonical.append('|').append(text==null ? -1 : text.length()).append(':').append(text==null ? "" : text);
        }
        try {
            row.put("_version",HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(canonical.toString().getBytes(StandardCharsets.UTF_8))));
        } catch(java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
        return row;
    }
}

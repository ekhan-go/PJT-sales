package com.pjt.sales.service;
import com.pjt.sales.dto.SalesWriteRequest;
import com.pjt.sales.repository.SalesReadRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class SalesWriteService {
    private final SalesReadRepository repository;
    private final SalesTableRegistry registry;
    public SalesWriteService(SalesReadRepository repository,SalesTableRegistry registry) { this.repository=repository; this.registry=registry; }
    public Map<String,Object> validate(String key,Map<String,Object> input) {
        var table=registry.table(key);
        if(input==null) throw new IllegalArgumentException("입력 데이터가 없습니다.");
        Map<String,String> errors=new LinkedHashMap<>();
        Map<String,Object> values=new LinkedHashMap<>();
        Set<String> allowed=new HashSet<>(); table.columns().forEach(c->allowed.add(c.name()));
        if(input.keySet().stream().anyMatch(name->!allowed.contains(name))) throw new IllegalArgumentException("허용되지 않는 입력 항목이 있습니다.");
        for(var column:table.columns()) {
            // PUT is a full replacement: a missing field is never silently cleared.
            if(!input.containsKey(column.name())) { errors.put(column.name(),"항목이 누락되었습니다."); continue; }
            Object raw=input.get(column.name());
            if(raw!=null && !(raw instanceof String) && !(raw instanceof Number)) { errors.put(column.name(),"올바른 값을 입력하세요."); continue; }
            String value=raw==null ? "" : raw.toString().trim();
            if(value.isEmpty()) { values.put(column.name(),null); continue; }
            try {
                switch(column.kind()) {
                    case TEXT -> {
                        if(value.codePointCount(0,value.length())>column.limit()) throw new IllegalArgumentException("최대 "+column.limit()+"자로 입력하세요.");
                        values.put(column.name(),value);
                    }
                    case NUMBER -> {
                        if(!value.matches("[+-]?[0-9]+")) throw new IllegalArgumentException("정수로 입력하세요.");
                        BigDecimal number=new BigDecimal(value);
                        if(number.abs().compareTo(BigDecimal.TEN.pow(column.limit()))>=0) throw new IllegalArgumentException("최대 "+column.limit()+"자리 정수로 입력하세요.");
                        values.put(column.name(),number);
                    }
                    case DATE -> {
                        LocalDateTime date=value.length()==10 ? LocalDate.parse(value).atStartOfDay() : LocalDateTime.parse(value);
                        if(date.getNano()!=0||date.getYear()<1||date.getYear()>9999) throw new IllegalArgumentException("일시는 초 단위까지 입력하세요.");
                        values.put(column.name(),date);
                    }
                }
            } catch(java.time.format.DateTimeParseException ex) { errors.put(column.name(),"올바른 날짜와 시간을 입력하세요."); }
              catch(IllegalArgumentException ex) { errors.put(column.name(),ex.getMessage()); }
        }
        if(!errors.isEmpty()) throw new SalesInputException(errors);
        return values;
    }
    private void checkVersion(Map<String,Object> current,String version) {
        if(version==null||!version.matches("[a-f0-9]{64}")) throw new IllegalArgumentException("최신 데이터를 조회한 후 다시 시도하세요.");
        if(!java.security.MessageDigest.isEqual(current.get("_version").toString().getBytes(java.nio.charset.StandardCharsets.US_ASCII),version.getBytes(java.nio.charset.StandardCharsets.US_ASCII))) throw new SalesConflictException();
    }
    @Transactional
    public void create(String table,SalesWriteRequest request) { repository.insert(table,validate(table,request.values())); }
    @Transactional
    public Map<String,Object> update(String table,String id,SalesWriteRequest request) {
        Map<String,Object> values=validate(table,request.values());
        Map<String,Object> current=repository.find(table,id,true);
        checkVersion(current,request.version());
        if(repository.update(table,id,values)!=1) throw new SalesConflictException();
        return repository.find(table,id,false);
    }
    @Transactional
    public void delete(String table,String id,String version) {
        Map<String,Object> current=repository.find(table,id,true); checkVersion(current,version);
        if(repository.delete(table,id)!=1) throw new SalesConflictException();
    }
}

package com.pjt.sales.service;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Component;
@Component
public class SalesTableRegistry {
    public enum Kind { TEXT, NUMBER, DATE }
    public record Column(String name, String label, Kind kind, int limit) {}
    public record TableSpec(String name, List<Column> columns, String orderBy) {}
    private static Column text(String name,String label) { return new Column(name,label,Kind.TEXT,26); }
    private static Column number(String name,String label,int precision) { return new Column(name,label,Kind.NUMBER,precision); }
    private static Column date(String name,String label) { return new Column(name,label,Kind.DATE,0); }
    private static final Map<String,TableSpec> TABLES=Map.of(
        "customers",new TableSpec("CUSTOMER",List.of(number("C_CODE","거래처 코드",5),text("C_NAME","거래처명"),text("C_CEO","대표자"),text("C_ADDR","주소"),text("C_PHONE","전화번호")),"C_CODE NULLS LAST,C_NAME NULLS LAST"),
        "products",new TableSpec("PRODUCT",List.of(number("P_CODE","상품 코드",5),text("P_NAME","상품명"),number("P_COST","가격",8),text("P_GROUP","분류")),"P_CODE NULLS LAST,P_NAME NULLS LAST"),
        "stocks",new TableSpec("STOCK",List.of(number("P_CODE","상품 코드",5),number("S_QTY","재고 수량",4),date("S_LASTDATE","최종 일자")),"P_CODE NULLS LAST,S_LASTDATE NULLS LAST"),
        "trades",new TableSpec("TRADE",List.of(number("T_SEQ","거래 번호",4),number("P_CODE","상품 코드",5),number("C_CODE","거래처 코드",5),date("T_DATE","거래 일자"),number("T_QTY","수량",4),number("T_COST","거래 금액",8),number("T_TAX","세금",8)),"T_SEQ DESC NULLS LAST,T_DATE DESC NULLS LAST")
    );
    public TableSpec table(String key) {
        TableSpec table=TABLES.get(key);
        if(table==null) throw new NoSuchElementException("조회할 수 없는 메뉴입니다.");
        return table;
    }
}

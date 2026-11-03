package com.pjt.sales;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class SalesReadHttpTests {
    @Autowired WebApplicationContext context;
    @Autowired JdbcTemplate jdbc;
    @Autowired DataSource source;
    MockMvc mvc;
    @BeforeEach void prepare() throws Exception {
        try(var connection=source.getConnection()) { assertEquals("H2",connection.getMetaData().getDatabaseProductName()); }
        jdbc.execute("CREATE TABLE IF NOT EXISTS CUSTOMER (C_CODE NUMBER(5),C_NAME VARCHAR2(26),C_CEO VARCHAR2(26),C_ADDR VARCHAR2(26),C_PHONE VARCHAR2(26))");
        jdbc.execute("CREATE TABLE IF NOT EXISTS PRODUCT (P_CODE NUMBER(5),P_NAME VARCHAR2(26),P_COST NUMBER(8),P_GROUP VARCHAR2(26))");
        jdbc.execute("CREATE TABLE IF NOT EXISTS STOCK (P_CODE NUMBER(5),S_QTY NUMBER(4),S_LASTDATE DATE)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS TRADE (T_SEQ NUMBER(4),P_CODE NUMBER(5),C_CODE NUMBER(5),T_DATE DATE,T_QTY NUMBER(4),T_COST NUMBER(8),T_TAX NUMBER(8))");
        for(String table:new String[]{"CUSTOMER","PRODUCT","STOCK","TRADE"}) jdbc.update("DELETE FROM "+table);
        mvc=MockMvcBuilders.webAppContextSetup(context).build();
    }
    @Test void emptyTablesReturn200AndEmptyContent() throws Exception {
        for(String table:new String[]{"customers","products","stocks","trades"})
            mvc.perform(get("/api/sales/"+table)).andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty()).andExpect(jsonPath("$.totalElements").value(0));
    }
    @Test void koreanNullsAndPaginationAreReturned() throws Exception {
        jdbc.update("INSERT INTO CUSTOMER(C_CODE,C_NAME) VALUES(2,'두번째')");
        jdbc.update("INSERT INTO CUSTOMER(C_CODE,C_NAME) VALUES(1,'첫번째')");
        mvc.perform(get("/api/sales/customers").param("size","1")).andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].C_NAME").value("첫번째"))
            .andExpect(jsonPath("$.content[0].C_PHONE").value(nullValue()))
            .andExpect(jsonPath("$.totalPages").value(2));
        mvc.perform(get("/api/sales/customers").param("size","1").param("page","2"))
            .andExpect(jsonPath("$.content[0].C_CODE").value(2));
    }
    @Test void allColumnTypesAndDuplicateCodesCanBeRead() throws Exception {
        jdbc.update("INSERT INTO PRODUCT VALUES(1,'상품',1000,'분류')");
        jdbc.update("INSERT INTO STOCK VALUES(1,0,DATE '2026-11-02')");
        jdbc.update("INSERT INTO STOCK VALUES(1,2,DATE '2026-11-02')");
        jdbc.update("INSERT INTO TRADE VALUES(1,1,1,DATE '2026-11-02',2,1000,100)");
        mvc.perform(get("/api/sales/products")).andExpect(status().isOk()).andExpect(jsonPath("$.content[0].P_NAME").value("상품"));
        mvc.perform(get("/api/sales/stocks")).andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.content[0].S_QTY").value(0))
            .andExpect(jsonPath("$.content[0].S_LASTDATE").isString());
        mvc.perform(get("/api/sales/trades")).andExpect(status().isOk()).andExpect(jsonPath("$.content[0].T_TAX").value(100));
    }
    @Test void unknownTablesBadPagingAndMalformedWritesAreRejected() throws Exception {
        mvc.perform(get("/api/sales/BOARD14")).andExpect(status().isNotFound());
        mvc.perform(get("/api/sales/customers").param("page","0")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/sales/customers").param("size","101")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/sales/customers").param("size","text")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/sales/customers")).andExpect(status().isBadRequest());
    }
}

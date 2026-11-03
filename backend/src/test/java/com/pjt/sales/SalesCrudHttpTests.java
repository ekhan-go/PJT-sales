package com.pjt.sales;
import com.jayway.jsonpath.JsonPath;
import java.util.*;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.junit.jupiter.api.Assertions.*;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@ActiveProfiles("test")
class SalesCrudHttpTests {
 @Autowired WebApplicationContext context;
 @Autowired JdbcTemplate jdbc;
 @Autowired DataSource source;
 MockMvc mvc;
 @BeforeEach void prepare() throws Exception {
  try(var connection=source.getConnection()){assertEquals("H2",connection.getMetaData().getDatabaseProductName());}
  jdbc.execute("CREATE TABLE IF NOT EXISTS CUSTOMER (C_CODE NUMBER(5),C_NAME VARCHAR2(26),C_CEO VARCHAR2(26),C_ADDR VARCHAR2(26),C_PHONE VARCHAR2(26))");
  jdbc.execute("CREATE TABLE IF NOT EXISTS PRODUCT (P_CODE NUMBER(5),P_NAME VARCHAR2(26),P_COST NUMBER(8),P_GROUP VARCHAR2(26))");
  jdbc.execute("CREATE TABLE IF NOT EXISTS STOCK (P_CODE NUMBER(5),S_QTY NUMBER(4),S_LASTDATE DATE)");
  jdbc.execute("CREATE TABLE IF NOT EXISTS TRADE (T_SEQ NUMBER(4),P_CODE NUMBER(5),C_CODE NUMBER(5),T_DATE DATE,T_QTY NUMBER(4),T_COST NUMBER(8),T_TAX NUMBER(8))");
  for(String table:new String[]{"CUSTOMER","PRODUCT","STOCK","TRADE"})jdbc.update("DELETE FROM "+table);
  mvc=MockMvcBuilders.webAppContextSetup(context).build();
 }
 String json(Object value){return com.jayway.jsonpath.Configuration.defaultConfiguration().jsonProvider().toJson(value);}
 Map<String,Object> sample(String table){
  return new LinkedHashMap<>(switch(table){
   case "customers" -> Map.of("C_CODE","123","C_NAME","한글 거래처","C_CEO","홍길동","C_ADDR","서울","C_PHONE","010-1234");
   case "products" -> Map.of("P_CODE","123","P_NAME","테스트 상품","P_COST","2500","P_GROUP","분류");
   case "stocks" -> Map.of("P_CODE","123","S_QTY","0","S_LASTDATE","2026-11-02T12:34:56");
   default -> Map.of("T_SEQ","123","P_CODE","123","C_CODE","123","T_DATE","2026-11-02T12:34:56","T_QTY","2","T_COST","5000","T_TAX","500");
  });
 }
 void create(String table,Map<String,Object> values)throws Exception{
  mvc.perform(post("/api/sales/"+table).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",values)))).andExpect(status().isCreated());
 }
 List<Map<String,Object>> list(String table)throws Exception{
  return JsonPath.read(mvc.perform(get("/api/sales/"+table)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(),"$.content");
 }
 Map<String,Object> detail(String table,String id)throws Exception{
  return JsonPath.read(mvc.perform(get("/api/sales/"+table+"/"+id)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(),"$");
 }
 String uri(String table,Map<String,Object> row){return "/api/sales/"+table+"/"+row.get("_rowId");}
 void deleteRow(String table,Map<String,Object> row)throws Exception{
  mvc.perform(delete(uri(table,row)).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("version",row.get("_version"))))).andExpect(status().isNoContent());
 }
 @Test void fourTablesSupportCreateReadUpdateDelete()throws Exception{
  for(String table:new String[]{"customers","products","stocks","trades"}){
   Map<String,Object> values=sample(table);create(table,values);
   Map<String,Object> row=list(table).get(0);assertNotNull(row.get("_rowId"));assertEquals(64,row.get("_version").toString().length());
   Map<String,Object> found=detail(table,row.get("_rowId").toString());assertEquals(row.get("_version"),found.get("_version"));
   String change=switch(table){case "customers"->"C_NAME";case "products"->"P_NAME";case "stocks"->"S_QTY";default->"T_QTY";};
   values.put(change,table.equals("stocks")||table.equals("trades") ? "7" : "수정 데이터");
   mvc.perform(put(uri(table,row)).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",values,"version",row.get("_version"))))).andExpect(status().isOk());
   Map<String,Object> updated=detail(table,row.get("_rowId").toString());assertNotEquals(row.get("_version"),updated.get("_version"));
   deleteRow(table,updated);assertTrue(list(table).isEmpty());
   mvc.perform(get(uri(table,row))).andExpect(status().isNotFound());
  }
 }
 @Test void duplicateCodesAndIdenticalRowsAreIndividuallyAddressable()throws Exception{
  create("customers",sample("customers"));create("customers",sample("customers"));
  var rows=list("customers");assertNotEquals(rows.get(0).get("_rowId"),rows.get(1).get("_rowId"));
  var values=sample("customers");values.put("C_NAME","두번째 수정");
  mvc.perform(put(uri("customers",rows.get(1))).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",values,"version",rows.get(1).get("_version"))))).andExpect(status().isOk());
  assertEquals("한글 거래처",detail("customers",rows.get(0).get("_rowId").toString()).get("C_NAME"));
  var updated=detail("customers",rows.get(1).get("_rowId").toString());deleteRow("customers",updated);assertEquals(1,list("customers").size());
 }
 @Test void staleEditsAndDeletesAreRejectedWithoutOverwritingNewData()throws Exception{
  create("customers",sample("customers"));var row=list("customers").get(0);
  jdbc.update("UPDATE CUSTOMER SET C_NAME='다른 사용자 수정'");
  mvc.perform(put(uri("customers",row)).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",sample("customers"),"version",row.get("_version"))))).andExpect(status().isConflict());
  mvc.perform(delete(uri("customers",row)).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("version",row.get("_version"))))).andExpect(status().isConflict());
  assertEquals("다른 사용자 수정",list("customers").get(0).get("C_NAME"));
  mvc.perform(delete(uri("customers",row)).contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isBadRequest());
 }
 @Test void searchFiltersCountsAndPagesAndTreatsWildcardsLiterally()throws Exception{
  for(int i=1;i<=5;i++){var values=sample("customers");values.put("C_CODE",String.valueOf(i));values.put("C_NAME",i==1?"100%_!SALE":"SALE 거래처");create("customers",values);}
  mvc.perform(get("/api/sales/customers").param("keyword","sale").param("size","2").param("page","3"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(5)).andExpect(jsonPath("$.totalPages").value(3)).andExpect(jsonPath("$.content.length()").value(1));
  mvc.perform(get("/api/sales/customers").param("field","C_NAME").param("keyword","%_!"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
  mvc.perform(get("/api/sales/customers").param("keyword","' OR 1=1 --"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
  mvc.perform(get("/api/sales/customers").param("field","C_CODE").param("keyword","5"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
 }
 @Test void dateSearchPreservesHoursMinutesAndSeconds()throws Exception{
  create("stocks",sample("stocks"));
  mvc.perform(get("/api/sales/stocks").param("field","S_LASTDATE").param("keyword","12:34:56"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].S_LASTDATE").value("2026-11-02T12:34:56"));
 }
 @Test void nullsCanBeSavedAndNumericDateFieldsCanBeCleared()throws Exception{
  create("stocks",sample("stocks"));var row=list("stocks").get(0);var values=sample("stocks");
  values.replaceAll((key,value)->null);
  mvc.perform(put(uri("stocks",row)).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",values,"version",row.get("_version")))))
   .andExpect(status().isOk()).andExpect(jsonPath("$.P_CODE").value(nullValue())).andExpect(jsonPath("$.S_QTY").value(nullValue())).andExpect(jsonPath("$.S_LASTDATE").value(nullValue()));
  deleteRow("stocks",list("stocks").get(0));
 }
 @Test void invalidInputsReturnFieldErrorsAndDoNotMutateExistingData()throws Exception{
  var values=sample("customers");values.put("C_CODE","100000");values.put("C_NAME","a".repeat(27));
  mvc.perform(post("/api/sales/customers").contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",values))))
   .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.C_CODE").exists()).andExpect(jsonPath("$.fieldErrors.C_NAME").exists());
  assertTrue(list("customers").isEmpty());
  var stock=sample("stocks");stock.put("S_LASTDATE","2026-02-30T12:00");
  mvc.perform(post("/api/sales/stocks").contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",stock))))
   .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.S_LASTDATE").exists());
  create("customers",sample("customers"));var row=list("customers").get(0);
  mvc.perform(put(uri("customers",row)).contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",Map.of("C_NAME","불완전"),"version",row.get("_version")))))
   .andExpect(status().isBadRequest());assertEquals("한글 거래처",list("customers").get(0).get("C_NAME"));
 }
 @Test void existingNumericPrecisionAllowsZeroAndSignedBoundaryValues()throws Exception{
  var values=sample("products");values.put("P_CODE","99999");values.put("P_COST","-99999999");create("products",values);
  assertEquals(-99999999,((Number)list("products").get(0).get("P_COST")).intValue());
  values.put("P_COST","100000000");
  mvc.perform(post("/api/sales/products").contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",values)))).andExpect(status().isBadRequest());
 }
 @Test void invalidIdsSearchFieldsUnknownTablesAndPayloadsAreRejected()throws Exception{
  mvc.perform(get("/api/sales/customers/invalid")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/sales/customers").param("field","C_NAME) OR 1=1 --")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/sales/BOARD14")).andExpect(status().isNotFound());
  mvc.perform(get("/api/sales/customers").param("keyword","a".repeat(201))).andExpect(status().isBadRequest());
  var values=sample("customers");values.put("_rowId","fake");
  mvc.perform(post("/api/sales/customers").contentType(MediaType.APPLICATION_JSON).content(json(Map.of("values",values)))).andExpect(status().isBadRequest());
 }
 @Test void jsonContentTypeAndMalformedJsonReturnHelpfulErrors()throws Exception{
  mvc.perform(post("/api/sales/customers").contentType(MediaType.TEXT_PLAIN).content("test"))
   .andExpect(status().isUnsupportedMediaType()).andExpect(jsonPath("$.message").value("Content-Type을 application/json으로 지정하세요."));
  mvc.perform(post("/api/sales/customers").contentType(MediaType.APPLICATION_JSON).content("{"))
   .andExpect(status().isBadRequest());
 }
}

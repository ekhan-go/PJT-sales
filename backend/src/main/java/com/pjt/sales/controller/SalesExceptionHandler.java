package com.pjt.sales.controller;
import com.pjt.sales.service.SalesInputException;
import com.pjt.sales.service.SalesRequestException;
import com.pjt.sales.service.SalesConflictException;
import java.util.Map;
import java.util.NoSuchElementException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
@RestControllerAdvice(assignableTypes=SalesController.class)
public class SalesExceptionHandler {
    private static final Logger log=LoggerFactory.getLogger(SalesExceptionHandler.class);
    public record ErrorResponse(int status,String message,Map<String,String> fieldErrors) {}
    @ExceptionHandler(SalesInputException.class)
    public ResponseEntity<ErrorResponse> fields(SalesInputException ex) { return ResponseEntity.badRequest().body(new ErrorResponse(400,ex.getMessage(),ex.getFieldErrors())); }
    @ExceptionHandler(SalesConflictException.class)
    public ResponseEntity<ErrorResponse> conflict(SalesConflictException ex) { return error(409,ex.getMessage()); }
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> missing(NoSuchElementException ex) { return error(404,ex.getMessage()); }
    @ExceptionHandler(SalesRequestException.class)
    public ResponseEntity<ErrorResponse> badRequest(SalesRequestException ex) { return error(400,ex.getMessage()); }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> invalid(IllegalArgumentException ex) { return error(400,ex.getMessage()); }
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> invalidType(Exception ex) { return error(400,"페이지와 크기는 정수로 입력하세요."); }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> invalidBody(Exception ex) { return error(400,"요청 본문의 JSON 형식을 확인하세요."); }
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> media(Exception ex) { return error(415,"Content-Type을 application/json으로 지정하세요."); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integrity(Exception ex) {
        log.warn("Sales data constraint violation",ex);
        String detail=ex.getMessage();
        if(detail!=null) {
            var matcher=java.util.regex.Pattern.compile("\"(C_CODE|C_NAME|C_CEO|C_ADDR|C_PHONE|P_CODE|P_NAME|P_COST|P_GROUP|S_QTY|S_LASTDATE|T_SEQ|T_DATE|T_QTY|T_COST|T_TAX)\"").matcher(detail);
            if(matcher.find()) return ResponseEntity.badRequest().body(new ErrorResponse(400,"입력 내용을 확인해 주세요.",Map.of(matcher.group(1),"DB가 허용하는 길이 또는 값의 범위를 확인하세요.")));
        }
        return error(400,"DB 저장 조건에 맞지 않습니다. 문자열 길이와 숫자 범위를 확인하세요. 입력값은 유지됩니다.");
    }
    @ExceptionHandler({DataAccessException.class,CannotCreateTransactionException.class})
    public ResponseEntity<ErrorResponse> database(Exception ex) {
        log.warn("Sales query failed",ex);
        return error(503,"판매관리 데이터를 처리하지 못했습니다. DB 연결과 테이블 구성을 확인하세요.");
    }
    private ResponseEntity<ErrorResponse> error(int status,String message) { return ResponseEntity.status(status).body(new ErrorResponse(status,message,Map.of())); }
}

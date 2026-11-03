package com.pjt.sales.service;
import java.util.Map;
public class SalesInputException extends IllegalArgumentException {
    private final Map<String,String> fieldErrors;
    public SalesInputException(Map<String,String> fieldErrors) {
        super("입력 내용을 확인해 주세요."); this.fieldErrors=Map.copyOf(fieldErrors);
    }
    public Map<String,String> getFieldErrors() { return fieldErrors; }
}

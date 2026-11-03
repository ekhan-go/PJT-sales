package com.pjt.sales.service;
public class SalesConflictException extends RuntimeException {
    public SalesConflictException() { super("다른 작업에서 변경된 데이터입니다. 최신 내용을 다시 확인한 후 저장해 주세요."); }
}

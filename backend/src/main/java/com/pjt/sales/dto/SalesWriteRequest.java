package com.pjt.sales.dto;
import java.util.Map;
public record SalesWriteRequest(Map<String,Object> values, String version) {}

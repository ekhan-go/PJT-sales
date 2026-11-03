package com.pjt.sales.dto;
import java.util.List;
import java.util.Map;
public record SalesPageResponse(List<Map<String,Object>> content, int page, int size, long totalElements, long totalPages) {}

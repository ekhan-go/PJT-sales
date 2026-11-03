package com.pjt.sales.service;
import com.pjt.sales.dto.SalesPageResponse;
import com.pjt.sales.repository.SalesReadRepository;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class SalesReadService {
    private final SalesReadRepository repository;
    public SalesReadService(SalesReadRepository repository) { this.repository=repository; }
    @Transactional(readOnly=true)
    public SalesPageResponse findPage(String table,int page,int size,String field,String keyword) {
        if(page<1||page>1000000) throw new IllegalArgumentException("페이지는 1~1000000 사이로 입력하세요.");
        if(size<1||size>100) throw new IllegalArgumentException("페이지 크기는 1~100 사이로 입력하세요.");
        keyword=keyword==null ? "" : keyword.trim();
        if(keyword.length()>200) throw new IllegalArgumentException("검색어는 200자 이내로 입력하세요.");
        long total=repository.count(table,field,keyword);
        return new SalesPageResponse(repository.findPage(table,page,size,field,keyword),page,size,total,(total+size-1)/size);
    }
    @Transactional(readOnly=true)
    public Map<String,Object> detail(String table,String id) { return repository.find(table,id,false); }
}

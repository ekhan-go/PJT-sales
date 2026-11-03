package com.pjt.sales.controller;
import com.pjt.sales.dto.*;
import com.pjt.sales.service.SalesReadService;
import com.pjt.sales.service.SalesWriteService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/sales")
public class SalesController {
    private final SalesReadService read;
    private final SalesWriteService write;
    public SalesController(SalesReadService read,SalesWriteService write) { this.read=read; this.write=write; }
    @GetMapping("/{table}")
    public SalesPageResponse list(@PathVariable("table") String table,
        @RequestParam(name="page",defaultValue="1") int page,@RequestParam(name="size",defaultValue="20") int size,
        @RequestParam(name="field",defaultValue="all") String field,@RequestParam(name="keyword",defaultValue="") String keyword) {
        return read.findPage(table,page,size,field,keyword);
    }
    @GetMapping("/{table}/{id}")
    public Map<String,Object> detail(@PathVariable("table") String table,@PathVariable("id") String id) { return read.detail(table,id); }
    @PostMapping("/{table}")
    public ResponseEntity<Map<String,String>> create(@PathVariable("table") String table,@RequestBody SalesWriteRequest request) {
        write.create(table,request); return ResponseEntity.status(201).body(Map.of("message","등록했습니다."));
    }
    @PutMapping("/{table}/{id}")
    public Map<String,Object> update(@PathVariable("table") String table,@PathVariable("id") String id,@RequestBody SalesWriteRequest request) { return write.update(table,id,request); }
    @DeleteMapping("/{table}/{id}")
    public ResponseEntity<Void> delete(@PathVariable("table") String table,@PathVariable("id") String id,@RequestBody SalesDeleteRequest request) {
        write.delete(table,id,request.version()); return ResponseEntity.noContent().build();
    }
}

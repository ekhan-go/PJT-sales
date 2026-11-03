package com.pjt.sales.controller;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/system")
public class SystemController {
    private static final Logger log = LoggerFactory.getLogger(SystemController.class);
    private final DataSource dataSource;
    public SystemController(DataSource dataSource) { this.dataSource = dataSource; }
    public record Status(String application, String database, boolean connected, String message) {}
    @GetMapping public ResponseEntity<Status> status() {
        try (Connection c = dataSource.getConnection(); Statement s = c.createStatement()) {
            s.setQueryTimeout(5);
            try (ResultSet r = s.executeQuery("SELECT 1 FROM DUAL")) {
                if (!r.next() || r.getInt(1) != 1) throw new SQLException("Connection check failed");
            }
            return ResponseEntity.ok(new Status("PJT-sales", c.getMetaData().getDatabaseProductName(), true, "DB 연결 성공"));
        } catch (SQLException ex) {
            log.warn("Database connection check failed", ex);
            return ResponseEntity.status(503).body(new Status("PJT-sales", "unknown", false, "DB 연결 실패: 서버 로그와 접속 설정을 확인하세요."));
        }
    }
}

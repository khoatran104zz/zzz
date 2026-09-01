package com.taskflow.config;

import com.taskflow.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRootStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "TaskFlow Backend REST API");
        status.put("status", "UP");
        status.put("swaggerDocs", "/swagger-ui.html");
        status.put("healthCheck", "/actuator/health");
        status.put("version", "v1.0.0-ENTERPRISE");

        return ResponseEntity.ok(ApiResponse.success("TaskFlow Service is running cleanly on Railway", status));
    }
}

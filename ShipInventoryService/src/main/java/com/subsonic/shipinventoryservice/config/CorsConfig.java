package com.subsonic.shipinventoryservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors.origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000}")
    private String corsOriginsRaw;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = parseOrigins(corsOriginsRaw);

        registry.addMapping("/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    private List<String> parseOrigins(String raw) {
        List<String> list = new ArrayList<>();
        if (raw == null || raw.isBlank()) {
            list.add("*");
            return list;
        }

        String cleaned = raw.trim();
        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }

        String[] parts = cleaned.split(",");
        for (String part : parts) {
            String origin = part.trim().replace("\"", "").replace("'", "");
            if (!origin.isEmpty()) {
                list.add(origin);
            }
        }

        if (list.isEmpty()) {
            list.add("*");
        }
        return list;
    }
}

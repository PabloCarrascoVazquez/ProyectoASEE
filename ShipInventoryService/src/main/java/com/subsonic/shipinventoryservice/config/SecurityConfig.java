package com.subsonic.shipinventoryservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig implements WebMvcConfigurer {

    private final JwtAuthInterceptor jwtAuthInterceptor;

    public SecurityConfig(JwtAuthInterceptor jwtAuthInterceptor) {
        this.jwtAuthInterceptor = jwtAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtAuthInterceptor)
                // Rutas protegidas (requieren JWT)
                .addPathPatterns(
                        "/api/inventario/**",
                        "/inventario/**",
                        "/api/envios/**",
                        "/envios/**"
                )
                // Ruta pública: GET /api/inventario/stock no requiere JWT
                .excludePathPatterns(
                        "/api/inventario/stock",
                        "/inventario/stock",
                        "/error",
                        "/actuator/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**"
                );
    }
}

package com.subsonic.shipinventoryservice.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.shipinventoryservice.dtos.responses.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    public static final String USER_ID_ATTRIBUTE = "userId";
    public static final String USER_ROLE_ATTRIBUTE = "userRole";

    @Value("${jwt.secret:super-secret-subsonic-key-jwt-2026}")
    private String secretKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Permitir peticiones preflight CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendUnauthorized(response, "Falta el token Bearer en la cabecera.");
            return false;
        }

        String token = authHeader.substring(7).trim();
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            JWTVerifier verifier = JWT.require(algorithm).build();
            DecodedJWT decodedJWT = verifier.verify(token);

            String userId = decodedJWT.getSubject();
            if (userId == null || userId.isBlank()) {
                userId = decodedJWT.getClaim("user_id").asString();
            }

            if (userId == null || userId.isBlank()) {
                sendUnauthorized(response, "El token no contiene un identificador de usuario válido (sub).");
                return false;
            }

            // Extraer rol del token para control de acceso Admin
            String role = decodedJWT.getClaim("role").asString();
            if (role == null) {
                role = decodedJWT.getClaim("rol").asString();
            }

            request.setAttribute(USER_ID_ATTRIBUTE, userId);
            request.setAttribute(USER_ROLE_ATTRIBUTE, role != null ? role : "user");
            return true;
        } catch (JWTVerificationException e) {
            sendUnauthorized(response, "Token inválido o expirado: " + e.getMessage());
            return false;
        }
    }

    private void sendUnauthorized(HttpServletResponse response, String detalle) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse error = new ErrorResponse(401, "Acceso no autorizado", detalle);
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }
}

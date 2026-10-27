package com.subsonic.shipinventoryservice;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.util.Date;

/**
 * Utilidad para generar tokens JWT en los tests de integración.
 * Usa el mismo secreto configurado en application.properties.
 */
public class TestJwtUtils {
    public static final String SECRET = "super-secret-subsonic-key-jwt-2026";

    public static String generateToken(String userId) {
        return JWT.create()
                .withSubject(userId)
                .withClaim("user_id", userId)
                .withClaim("role", "user")
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 3600 * 1000))
                .sign(Algorithm.HMAC256(SECRET));
    }

    public static String generateAdminToken(String userId) {
        return JWT.create()
                .withSubject(userId)
                .withClaim("user_id", userId)
                .withClaim("role", "admin")
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 3600 * 1000))
                .sign(Algorithm.HMAC256(SECRET));
    }

    public static String generateExpiredToken(String userId) {
        return JWT.create()
                .withSubject(userId)
                .withClaim("user_id", userId)
                .withIssuedAt(new Date(System.currentTimeMillis() - 7200 * 1000))
                .withExpiresAt(new Date(System.currentTimeMillis() - 3600 * 1000))
                .sign(Algorithm.HMAC256(SECRET));
    }
}

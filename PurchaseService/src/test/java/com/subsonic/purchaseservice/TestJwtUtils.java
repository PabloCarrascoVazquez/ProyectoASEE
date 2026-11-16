package com.subsonic.purchaseservice;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.util.Date;
import java.util.Objects;

public class TestJwtUtils {
    public static final String SECRET = Objects.requireNonNull(
            System.getenv("SECRET_KEY"),
            "La variable de entorno SECRET_KEY es obligatoria para ejecutar los tests"
    );

    public static String generateToken(String userId) {
        return JWT.create()
                .withSubject(userId)
                .withClaim("user_id", userId)
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
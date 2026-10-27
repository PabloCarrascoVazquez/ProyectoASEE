package com.subsonic.shipinventoryservice.config;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}

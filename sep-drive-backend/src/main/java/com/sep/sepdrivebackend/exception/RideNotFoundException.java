package com.sep.sepdrivebackend.exception;

public class RideNotFoundException extends RuntimeException {
    public RideNotFoundException(String message) {
        super(message);
    }
}

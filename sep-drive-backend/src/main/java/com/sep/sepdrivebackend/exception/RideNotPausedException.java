package com.sep.sepdrivebackend.exception;

public class RideNotPausedException extends RuntimeException {
    public RideNotPausedException(String message) {
        super(message);
    }
}

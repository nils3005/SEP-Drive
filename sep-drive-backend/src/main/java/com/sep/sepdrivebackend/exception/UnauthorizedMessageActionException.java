package com.sep.sepdrivebackend.exception;

public class UnauthorizedMessageActionException extends RuntimeException {
    public UnauthorizedMessageActionException(String message) {
        super(message);
    }
}

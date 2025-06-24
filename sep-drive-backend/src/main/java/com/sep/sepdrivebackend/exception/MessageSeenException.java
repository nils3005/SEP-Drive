package com.sep.sepdrivebackend.exception;

public class MessageSeenException extends RuntimeException {
    public MessageSeenException(String message) {
        super(message);
    }
}

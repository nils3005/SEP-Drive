package com.sep.sepdrivebackend.exception;

public class UserNotPartOfChatException extends RuntimeException {
    public UserNotPartOfChatException(String message) {
        super(message);
    }
}

package com.sep.sepdrivebackend.exception;

public class MessageNotInChatException extends RuntimeException {
    public MessageNotInChatException(String message) {
        super(message);
    }
}

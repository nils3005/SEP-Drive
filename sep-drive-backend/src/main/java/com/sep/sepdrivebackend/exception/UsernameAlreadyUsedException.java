package com.sep.sepdrivebackend.exception;

public class UsernameAlreadyUsedException extends RuntimeException {
    public UsernameAlreadyUsedException(String message) {
        super(message);
    }
}

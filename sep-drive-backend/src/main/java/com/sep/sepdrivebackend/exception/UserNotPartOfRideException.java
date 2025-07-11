package com.sep.sepdrivebackend.exception;

public class UserNotPartOfRideException extends RuntimeException {
    public UserNotPartOfRideException(String message) {
        super(message);
    }
}

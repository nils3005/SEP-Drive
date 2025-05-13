package com.sep.sepdrivebackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyDto {
    private String username;
    private String code;
}

package com.sep.sepdrivebackend.Dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Getter
@Setter
@Service
public class LoginDto {
    private String username;
    private String password;
}

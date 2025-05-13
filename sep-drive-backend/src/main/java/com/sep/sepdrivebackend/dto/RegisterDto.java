package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.CarType;
import com.sep.sepdrivebackend.entities.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterDto {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String username;
    private String birthDate;
    private String profilePicture;
    @Enumerated(EnumType.STRING)
    private CarType carType;
    @Enumerated(EnumType.STRING)
    private Role role;
}

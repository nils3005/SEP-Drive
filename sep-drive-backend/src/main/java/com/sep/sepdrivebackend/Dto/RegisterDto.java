package com.sep.sepdrivebackend.Dto;

import com.sep.sepdrivebackend.Model.CarType;
import com.sep.sepdrivebackend.Model.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

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

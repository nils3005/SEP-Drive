package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String password;
    private Role role;
    private String firstName;
    private String lastName;
    private LocalDate birthdate;
    private byte[] profilePicture;
    private Double rating;
    private Long numberOfRides;
    private CarType carType;
    private Financials financials;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthdate(user.getBirthdate())
                .profilePicture(user.getProfilePicture())
                .rating(user.getRatings()
                        .stream()
                        .mapToInt(Rating::getRating)
                        .average()
                        .orElse(0.0)
                )
                .numberOfRides(user.getNumberOfRides())
                .carType(user.getCarType())
                .financials(user.getFinancials())
                .build();
    }
}

package com.sep.sepdrivebackend.Model;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublicUser {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String birthDate;
    private float rating;
    private int numberOfRides;
    private String profilePicture;
    @Enumerated(EnumType.STRING)
    private CarType carType;
    @Enumerated(EnumType.STRING)
    private Role role;

    public PublicUser(String username, Role role, String firstName, String lastName, String email, String birthDate, String profilePicture, float rating, int numberOfRides, CarType carType) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.birthDate = birthDate;
        this.rating = rating;
        this.numberOfRides = numberOfRides;
        this.carType = carType;
        this.role = role;
        this.profilePicture = profilePicture;
    }
}

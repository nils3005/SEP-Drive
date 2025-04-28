package com.sep.sepdrivebackend.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Entity
public class DriveUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userID;

    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String firstName;
    @Column(nullable = false)
    private String lastName;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String birthDate;
    private float rating;
    private int numberOfRides;
    private int numberOfRatings;
    private float numberOfStars;
    private String profilePicture;

    @Enumerated(EnumType.STRING)
    private CarType carType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean verified=false;

    private String verificationCode;

    public DriveUser(){}

    public DriveUser(String username, String password, String firstName, String lastName, String email, String birthDate, /*String profilePicture,*/ /*CarType carType,*/ Role role) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.birthDate = birthDate;
        this.role = role;
    }


}

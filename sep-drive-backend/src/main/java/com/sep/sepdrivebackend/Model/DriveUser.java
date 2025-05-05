package com.sep.sepdrivebackend.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@Entity
public class DriveUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long userID;

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
    private int numberOfRides;
    private String profilePicture;
    @OneToMany(mappedBy = "driveUser")
    private List<Rating> ratings = new ArrayList<>();
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

package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "drive_users")
@Getter @Setter @NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column (nullable = false)
    private String password;

    @Column (nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private LocalDate birthdate;

    private String profilePicture;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user", orphanRemoval = true)
    private List<Rating> ratings;

    //@ElementCollection
    //private List<Integer> ratings;

    private int numberOfRides;

    @Enumerated(EnumType.STRING)
    private CarType carType;

    private boolean verified;

    private String verificationCode;

    public float getAvgRating() {
        int count = ratings.size();
        float avgRating = 0;
        for (Rating rating : ratings) {
            avgRating += rating.getRating();
        }
        avgRating /= count;
        return avgRating;
    }

    public User(String username, String email, String password, Role role, String firstName, String lastName, LocalDate birthdate, String profilePicture) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthdate = birthdate;
        this.profilePicture = profilePicture;
    }
}
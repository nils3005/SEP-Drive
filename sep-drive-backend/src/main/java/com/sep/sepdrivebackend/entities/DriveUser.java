package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor
public class DriveUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ist eindeutig

    @Column(nullable = false, unique = true) //ist eindeutig
    private String username;

    @Column(nullable = false, unique = true) // ist eindeutig
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
    private LocalDate birthdate;       //yyyy.mm.dd weil nach jahr sortierbar (Alter) wäre einfacher

    // eigentlich macht man das mit Picture nicht, weil man das auch einfach in einen Verzeichnis
    // als Datei mt der UserID als Dateinamen ablegen kann und mit getter/setter abrufen.
    // sollte nicht in der DB liegen, weil schnell zu große Dateien (macht DB aua)
    //hier machen wir es schon, weil der Kontext kleiner ist
    private String profilePicture;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "driveUser", orphanRemoval = true)
    //@JoinColumn(name = "ratingId")
    private List<Rating> ratings;

    //@ElementCollection
    //private List<Integer> ratings;

    private int numberOfRides;

    @Enumerated(EnumType.STRING)
    private CarType carType;     //None ist dann der Kunde (schlauer weil nicht doppelte Verwaltung)

    private boolean verified;

    private String verificationCode;

}
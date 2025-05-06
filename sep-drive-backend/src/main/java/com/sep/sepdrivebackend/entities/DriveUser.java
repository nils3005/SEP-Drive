package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class DriveUser { // Die Klasse darf nicht User heißen, weil der Name als Tabellenname in H2 schon verwendet wird, leichter fürs Testen
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long userID; // ist eindeutig

    @Column(name = "username", nullable = false) //ist eindeutig
    private String username;

    @Column(name = "email", nullable = false) // ist eindeutig
    private String email;

    @Column (name = "password", nullable = false)
    private String password;

    @Column (name = "role", nullable = false)
    private Role role;

    @Column(name = "firstName", nullable = false)
    private String firstName;

    @Column(name = "lastName", nullable = false)
    private String lastName;

    @Column(name = "birthdate", nullable = false)
    private Date birthdate;       //yyyy.mm.dd weil nach jahr sortierbar (Alter) wäre einfacher

    @Column (name = "profilePicture")
    private String profilePicture;



    @OneToMany(cascade = CascadeType.ALL, mappedBy = "driveUser", orphanRemoval = true)
    //@JoinColumn(name = "ratingId")
    private List<Rating> ratings;

    //@Column (name = "rating")
    //private ArrayList<Float> rating = new ArrayList<Float>(); geht nicht weil in Colum keine Liste sein darf

    @Column(name = "numberOfRides")
    private int numberOfRides;

    @Column (name = "carType", nullable = false)
    private CarType carType;     //None ist dann der Kunde (schlauer weil nicht doppelte Verwaltung)

    @Column (name = "verified")
    private boolean verified;

    @Column (name = "verificationCode")
    private String verificationCode;



    public void setUsername(String username) {
        this.username = username;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setBirthdate(Date birthdate) {
        this.birthdate = birthdate;
    }

    public void setNumberOfRides(int numberOfRides) {
        this.numberOfRides = numberOfRides;
    }

    public void setCarType(CarType carType) {
        this.carType = carType;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setProfilePicture(String profilePicture) {this.profilePicture = profilePicture;}

    public void setVerified(boolean verified) {this.verified = verified;}

    public void setVerificationCode(String verificationCode) {this.verificationCode = verificationCode;}




    public long getUserId() {
        return userID;
    }

    public String getUsername() {
        return username;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public float getAvgRating() {
        int count = ratings.size();
        float avgRating = 0;
        for (Rating rating : ratings) {

            avgRating += rating.getRating();
        }
        avgRating /= count;
        return avgRating;
    }

    public Date getBirthdate() {
        return birthdate;
    }

    public int getNumberOfRides() {
        return numberOfRides;
    }

    public CarType getCarType() {
        return carType;
    }

    public Role getRole() {return role;}

    public String getPassword() {
        return password;
    }

    public String getProfilePicture() {return profilePicture;}

    public boolean isVerified() {return verified;}

    public String getVerificationCode() {return verificationCode;}

    // eigentlich macht man das mit Picture nicht, weil man das auch einfach in einen Verzeichnis
    // als Datei mt der UserID als Dateinamen ablegen kann und mit getter/setter abrufen.
    // sollte nicht in der DB liegen, weil schnell zu große Dateien (macht DB aua)
    //hier machen wir es schon, weil der Kontext kleiner ist

    private enum Role {
        CUSTOMER(0),
        DRIVER(1);
        private final int roleID;
        Role(int roleID) {
            this.roleID = roleID;
        }
    }
    private enum CarType {    //Null für Kunde

        SMALL(0),
        MEDIUM(1),
        DELUXE(2);
        private final int carTypeID;
        CarType(int carTypeID) {
            this.carTypeID = carTypeID;
        }
    }

    public DriveUser() {
        super();
    }


}
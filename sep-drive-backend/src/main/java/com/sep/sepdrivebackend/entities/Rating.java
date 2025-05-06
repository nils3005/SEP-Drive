package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;

@Entity
@Table (name = "ratings")

public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "ratingID")
    private long ratingId;

    @ManyToOne
    @JoinColumn(name = "driveUserID")
    private DriveUser driveUser;


    @Column (name = "rating")
    private float rating;

    public Rating() {
        super();
    }

    public void setRecipient(DriveUser driveUser) {
        this.driveUser = driveUser;
    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    public float getRating() {
        return rating;
    }

    public long getRatingId() {
        return ratingId;
    }

    public DriveUser getDriveUser() {
        return driveUser;
    }

    public void setDriveUser(DriveUser driveUser) {
        this.driveUser = driveUser;
    }
}

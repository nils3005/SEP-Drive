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
    @JoinColumn(name = "driveUserID", referencedColumnName = "userID")
    private DriveUser driveUser;


    @Column (name = "rating")
    private float rating;

    public Rating() {
        super();
    }
}

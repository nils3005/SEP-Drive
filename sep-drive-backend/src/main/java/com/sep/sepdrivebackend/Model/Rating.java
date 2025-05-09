package com.sep.sepdrivebackend.Model;

import jakarta.persistence.*;

@Entity
public class Rating {
    @Id
    private long ratinID;

    private float ratingValue;

    @ManyToOne
    @JoinColumn(name = "userID")
    private User user;
}

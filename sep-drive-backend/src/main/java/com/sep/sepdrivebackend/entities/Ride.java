package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rideId;
    @OneToOne
    private User driver;
    @OneToOne
    private User customer;
    private float speed;
    private float price;
    private float distance;
    private float duration;
    private RideStatus status;
    private int coordsIndex;
    @Lob
    private String geoJson;

    public Ride(User driver, User customer, float speed, float price, float distance, String geoJson, float duration) {
        this.driver = driver;
        this.customer = customer;
        this.speed = speed;
        this.price = price;
        this.distance = distance;
        this.geoJson = geoJson;
        this.duration = duration;
        this.status = RideStatus.PAUSED;
        this.coordsIndex = 0;
    }
}

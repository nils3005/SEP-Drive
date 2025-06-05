package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
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
    /*private Rating driverRating;
    private Rating customerRating;*/
    private float price;
    private float distance;
    private float duration;
    private RideStatus status;
    /*@ElementCollection
    private double[] coords;*/
    private int coordsIndex;
    @Lob
    private String geoJson;
}

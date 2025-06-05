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
    private double speed;
    /*private Rating driverRating;
    private Rating customerRating;*/
    private double price;
    private RideStatus status;
    private String coords;
    @Lob
    private String geoJson;
}

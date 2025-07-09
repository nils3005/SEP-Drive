package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

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
    private double price;
    private float distance;
    private float duration;
    private CarType carType;
    private RideStatus status;
    private int coordsIndex;
    @Lob
    private String geoJson;

    public Ride(User driver, User customer, float speed, double price, float distance, String geoJson, float duration, CarType carType) {
        this.driver = driver;
        this.customer = customer;
        this.speed = speed;
        this.price = new BigDecimal(price).setScale(2, RoundingMode.HALF_UP).doubleValue();
        this.distance = distance;
        this.geoJson = geoJson;
        this.duration = duration;
        this.status = RideStatus.PAUSED;
        this.coordsIndex = 0;
        this.carType = carType;
    }

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "latitude", column = @Column(name = "start_latitude")),
            @AttributeOverride(name = "longitude", column = @Column(name = "start_longitude"))
    })
    private Location startLocation;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "latitude", column = @Column(name = "end_latitude")),
            @AttributeOverride(name = "longitude", column = @Column(name = "end_longitude"))
    })
    private Location destination;

    @ElementCollection
    @CollectionTable(name = "ride_waypoints", joinColumns = @JoinColumn(name = "ride_id"))
    private List<Location> waypoints;
}

package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity  /*Bedeutet, dass diese Klasse in der Datenbank als Tabelle gespeichert wird.*/
@Getter @Setter @NoArgsConstructor /*automatically generates getter and setter methods for all these fields.*/
public class RideRequest{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private User customer;

    @Embedded
    private Location startLocation;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "latitude", column = @Column(name = "destination_latitude")),
            @AttributeOverride(name = "longitude", column = @Column(name = "destination_longitude"))
    })
    private Location destination;

    @Enumerated(EnumType.STRING)
    private CarType carType;

    private boolean active;

    @OneToMany(mappedBy = "rideRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RideOffer> rideOffers = new ArrayList<>();
}

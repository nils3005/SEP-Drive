package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.CarType;
import com.sep.sepdrivebackend.entities.Location;
import com.sep.sepdrivebackend.entities.Rating;
import com.sep.sepdrivebackend.entities.RideRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RideRequestDto {
    private Long id;
    private Long customerId;
    private Location startLocation;
    private Location destination;
    private CarType carType;
    private List<Location> waypoints;
    private boolean active;
    private LocalDateTime createdAt;
    private String username;
    private Double userRating;
    // Liste der RideOffers nicht mitschicken => kann man über RideOfferController mit rrId holen


    public static RideRequestDto fromEntity(RideRequest rideRequest) {
        return RideRequestDto.builder()
                .id(rideRequest.getId())
                .customerId(rideRequest.getId())
                .startLocation(rideRequest.getStartLocation())
                .destination(rideRequest.getDestination())
                .waypoints(rideRequest.getWaypoints())
                .carType(rideRequest.getCarType())
                .active(rideRequest.isActive())
                .createdAt(rideRequest.getCreatedAt())
                .username(rideRequest.getCustomer().getUsername())
                .userRating(rideRequest.getCustomer().getRatings().stream().mapToDouble(Rating::getRating).average().orElse(0.0))
                .build();
    }

}


package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.CarType;
import com.sep.sepdrivebackend.entities.Location;
import com.sep.sepdrivebackend.entities.RideRequest;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RideRequestDto {
    private Long id;
    private Long customerId;
    private Location startLocation;
    private Location destination;
    private CarType carType;
    private boolean active;
    // Liste der RideOffers nicht mitschicken => kann man über RideOfferController mit rrId holen

    public static RideRequestDto fromEntity(RideRequest rideRequest) {
        return RideRequestDto.builder()
                .id(rideRequest.getId())
                .customerId(rideRequest.getId())
                .startLocation(rideRequest.getStartLocation())
                .destination(rideRequest.getDestination())
                .carType(rideRequest.getCarType())
                .active(rideRequest.isActive())
                .build();
    }

}

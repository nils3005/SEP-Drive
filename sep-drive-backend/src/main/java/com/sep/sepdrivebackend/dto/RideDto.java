package com.sep.sepdrivebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.sep.sepdrivebackend.entities.Location;

import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RideDto {
    private long driverId;
    private long customerId;
    private float speed;
    private float distance;
    private float duration;
    private String geoJson;
    private Location startLocation;
    private Location destination;
    private List<Location> waypoints;
}

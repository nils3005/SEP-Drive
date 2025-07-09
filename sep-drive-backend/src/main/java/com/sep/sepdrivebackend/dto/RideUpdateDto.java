package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.Location;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class RideUpdateDto {
    private Long rideId;
    private boolean paused;
    private boolean resuming;
    private boolean completed;
    private float speed;
    private int coordsIndex;
    private Long historyId;
    private List<Location> waypoints;
    private Location destination;
    private float price;
    private float distance;
    private float duration;
    private String geoJson;


}

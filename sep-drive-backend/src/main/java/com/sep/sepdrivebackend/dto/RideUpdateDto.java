package com.sep.sepdrivebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

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
}

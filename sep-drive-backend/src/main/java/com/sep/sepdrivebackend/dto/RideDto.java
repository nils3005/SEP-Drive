package com.sep.sepdrivebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
}

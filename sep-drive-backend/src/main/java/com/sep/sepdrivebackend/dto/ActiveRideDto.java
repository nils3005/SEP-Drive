package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.Ride;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ActiveRideDto {
    private Ride ride;
    private List<double[]> coords;
    private List<Double> speeds;
}

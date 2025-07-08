package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.Location;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptimizedWaypointsDTO {
    private List<Location> optimizedWaypoints;
}
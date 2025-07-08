package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.OptimizedWaypointsDTO;
import com.sep.sepdrivebackend.entities.Location;
import com.sep.sepdrivebackend.service.RouteOptimizationService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route")
public class RouteOptimizationController {

    @Autowired
    private RouteOptimizationService routeOptimizationService;

    @PostMapping("/optimize-waypoints")
    public OptimizedWaypointsDTO optimizeWaypoints(@RequestBody OptimizeWaypointsRequest request) {
        List<Location> optimized = routeOptimizationService.getOptimizedWaypoints(
                request.getStart(),
                request.getWaypoints()
        );
        return new OptimizedWaypointsDTO(optimized);
    }

    @Getter
    @Setter
    public static class OptimizeWaypointsRequest {
        private Location start;
        private List<Location> waypoints;
    }
}
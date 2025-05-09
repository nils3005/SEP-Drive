package com.sep.sepdrivebackend.controllers;

import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.services.RideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {

    @Autowired
    private RideRequestService rideRequestService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody RideRequest request, @RequestParam Long customerId) {
        try {
            RideRequest created = rideRequestService.createRideRequest(request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active/{customerId}")
    public ResponseEntity<?> getActive(@PathVariable Long customerId) {
        RideRequest activeRide = rideRequestService.getActiveRide(customerId);
        if (activeRide == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No active ride request found"));
        }
        return ResponseEntity.ok(activeRide);
    }

    @DeleteMapping("/cancel/{customerId}")
    public ResponseEntity<?> cancel(@PathVariable Long customerId) {
        rideRequestService.deleteActiveRide(customerId);
        return ResponseEntity.ok(Map.of("message", "Ride request cancelled"));
    }
}

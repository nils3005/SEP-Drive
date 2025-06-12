package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.service.RideRequestService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {

    @Autowired
    private RideRequestService rideRequestService;

    @GetMapping("/all")
    public ResponseEntity<List<RideRequest>> getAllRideRequests() {
        return new ResponseEntity<>(rideRequestService.getAllRideRequests(), HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody RideRequest request) {
        try {
            RideRequest created = rideRequestService.createRideRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive() {
        RideRequest activeRide = rideRequestService.getActiveRide();
        if (activeRide == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No active ride request found"));
        }
        return ResponseEntity.ok(activeRide);
    }

    @DeleteMapping("/cancel")
    public ResponseEntity<?> cancel() {
        rideRequestService.deleteActiveRide();
        return ResponseEntity.ok(Map.of("message", "Ride request cancelled"));
    }
}

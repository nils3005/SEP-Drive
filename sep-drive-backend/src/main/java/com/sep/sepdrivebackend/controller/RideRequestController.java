package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.RideRequestDto;
import com.sep.sepdrivebackend.dto.RidePriceDto;
import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.service.RideOfferService;
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
    @Autowired
    private RideOfferService rideOfferService;

    @GetMapping("/all")
    public ResponseEntity<List<RideRequestDto>> getAllRideRequests() {
        return new ResponseEntity<>(rideRequestService.getAllOpenRideRequestsForDriver(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideRequestDto> getRideRequestById(@PathVariable("id") Long id)
    {
        RideRequest rideRequest = rideRequestService.getRideRequestById(id);
        if (rideRequest == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(RideRequestDto.fromEntity(rideRequestService.getRideRequestById(id)),
                HttpStatus.OK);
    }

    @PostMapping("/price")
    public ResponseEntity<?> getPrice(@RequestBody RidePriceDto ridePriceDto) {
        try{
            double price = rideRequestService.ridePrice(ridePriceDto);
            return new ResponseEntity<>(price, HttpStatus.OK);
        } catch (RuntimeException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
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
    public ResponseEntity<RideRequestDto> getActive() {
        RideRequest activeRide = rideRequestService.getActiveRide();

        if (activeRide == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } else {
            return ResponseEntity.ok(RideRequestDto.fromEntity(activeRide));
        }
    }

    @DeleteMapping("/cancel")
    public ResponseEntity<?> cancel() {
        RideRequest activeRideRequest = rideRequestService.getActiveRide();
        rideRequestService.deactivateCurrentRideRequest();
        int deleted = rideOfferService.rejectAllOffersForRideRequest(activeRideRequest);
        return ResponseEntity.ok(Map.of("message", "Ride request cancelled. Number of offers rejected: " + deleted));
    }

}

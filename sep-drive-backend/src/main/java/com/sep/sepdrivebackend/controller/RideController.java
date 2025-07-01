package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.RideDto;
import com.sep.sepdrivebackend.dto.RideUpdateDto;
import com.sep.sepdrivebackend.exception.*;
import com.sep.sepdrivebackend.service.RideService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ride")
public class RideController {
    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveRide() {
        try{
            return ResponseEntity.ok(rideService.getRide());
        } catch (RideNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch(GeoJsonParsingException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<String> addRide(@RequestBody RideDto rideDto) {
        try{
            rideService.addRide(rideDto);
            return ResponseEntity.ok("Ride added");
        } catch (UserHasRideExcpetion e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (UserNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/updateRide")
    public ResponseEntity<?> updateRide(@RequestBody RideUpdateDto rideUpdateDTO) {
        try {
            rideService.updateRide(rideUpdateDTO);
            return ResponseEntity.ok("Ride updated");
        } catch (RideNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/updateRoute")
    public ResponseEntity<?> updateRoute(@RequestBody RideUpdateDto rideUpdateDTO) {
        try{
            rideService.editRide(rideUpdateDTO);
            return ResponseEntity.ok("Route updated");
        } catch (RideNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UserNotPartOfRideException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (InsufficientFundsException e){
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(e.getMessage());
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/updateIndex/{rideId}/{index}")
    public ResponseEntity<?> updateIndex(@PathVariable Long rideId, @PathVariable int index) {
        try {
            rideService.updateIndex(rideId, index);
            return ResponseEntity.ok("Ride index updated");
        } catch (RideNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}


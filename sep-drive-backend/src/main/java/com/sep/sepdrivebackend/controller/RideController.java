package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.RideRequestForDriverDto;
import com.sep.sepdrivebackend.dto.RideUpdateDto;
import com.sep.sepdrivebackend.entities.Ride;
import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.exception.GeoJsonParsingException;
import com.sep.sepdrivebackend.exception.RideNotFoundException;
import com.sep.sepdrivebackend.exception.UserHasRideExcpetion;
import com.sep.sepdrivebackend.service.RideRequestService;
import com.sep.sepdrivebackend.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ride")
public class RideController {
    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    //Methode nur zum testen
    @GetMapping("/all")
    public ResponseEntity<?> getAllRides() {
        try{
            return ResponseEntity.ok(rideService.allRides());
        } catch (Exception e){
            return ResponseEntity.notFound().build();
        }
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
    public ResponseEntity<String> addRide(@RequestBody Ride ride) {
        try{
            rideService.addRide(ride);
            return ResponseEntity.ok("Ride added");
        } catch (UserHasRideExcpetion e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/updateRide")
    public ResponseEntity<?> updateRide(@RequestBody RideUpdateDto rideUpdateDTO) {
        try {
            rideService.updateRide(rideUpdateDTO);
            return ResponseEntity.ok("Ride updated");
        } catch (RideNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
        catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @RestController
    @RequestMapping("/api/ride-requests-driver")
    public static class RideRequestDriverController {

        @Autowired
        private RideRequestService rideRequestService;

        @GetMapping("/available")
        public ResponseEntity<List<RideRequestForDriverDto>> getAvailableRideRequests(
                @RequestParam double driverLat,
                @RequestParam double driverLon,
                @RequestParam(defaultValue = "rideId") String sortBy,
                @RequestParam(defaultValue = "true") boolean ascending) {

            List<RideRequest> availableRides = rideRequestService.getAllAvailableRideRequests();

            List<RideRequestForDriverDto> dtos = rideRequestService.getAvailableRideRequestsForDriver(
                    driverLat, driverLon, sortBy, ascending, availableRides);

            return ResponseEntity.ok(dtos);
        }
    }
}

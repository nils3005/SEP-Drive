package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.services.RideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController /* This class is a controller. It will receive requests from the frontend and send back JSON. come with springbot */
@RequestMapping("/api/ride-requests") /*  “All the requests that **start with /api/ride-requests should come to this class. come with springbot✅”*/
public class RideRequestController /*this is the controller class*/{

    @Autowired
    private RideRequestService rideRequestService; /*it is a helper so we can use it , it is private cause onlz teh controller can use it*/

    @PostMapping("/create") /*@PostMapping("/create") means:
➡️ When a request comes to /api/ride-requests/create, this method runs.*/
    public ResponseEntity<?> create(@RequestBody RideRequest request, @RequestParam Long customerId)
    /*   we  need these things in order to do my job and Spring Boot puts the data into your method for you. ✅ */
    {
        /*This method will send a response back (like success or error).*It’s a tool (class) from Spring Boot that sends a reply back to the user (frontend)./
        /*<?> = means the box can hold anything (JSON, text, error, etc.).*/
        /*create is the name of the methode */
        try {
            RideRequest created = rideRequestService.createRideRequest(request, customerId);
            /*  the method gives back a RideRequest, you need to save it in a variable of the same type.*/
            /*The controller (boss) says to the service (helper):
➡️ “Here’s the ride data + customer ID—please create this ride for me! amnd it vgo to the servoce class*/
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active/{customerId}")   /*@PostMapping("/active") means:
➡️ When a request comes to /api/ride-requests/active, this method runs.*/
    public ResponseEntity<?> getActive(@PathVariable Long customerId) {
        RideRequest activeRide = rideRequestService.getActiveRide(customerId);
        if (activeRide == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No active ride request found"));
        }
        return ResponseEntity.ok(activeRide);
    }

    @DeleteMapping("/cancel/{customerId}")/*@PostMapping("/cancel") means:
➡️ When a request comes to /api/ride-requests/cancel, this method runs.*/
    public ResponseEntity<?> cancel(@PathVariable Long customerId) {
        rideRequestService.deleteActiveRide(customerId);
        return ResponseEntity.ok(Map.of("message", "Ride request cancelled"));
    }
}

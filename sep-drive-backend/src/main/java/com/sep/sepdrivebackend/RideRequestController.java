package com.sep.sepdrivebackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {

    @Autowired
    private RideRequestService rideRequestService;

    @PostMapping("/create")
    public RideRequest create(@RequestBody RideRequest request, @RequestParam Long customerId) {
        return rideRequestService.createRideRequest(request, customerId);
    }

    @GetMapping("/active/{customerId}")
    public RideRequest getActive(@PathVariable Long customerId) {
        return rideRequestService.getActiveRide(customerId);
    }

    @DeleteMapping("/cancel/{customerId}")
    public String cancel(@PathVariable Long customerId) {
        rideRequestService.deleteActiveRide(customerId);
        return "Ride request cancelled";
    }
}

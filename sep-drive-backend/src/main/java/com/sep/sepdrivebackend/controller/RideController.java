package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.RideUpdateDto;
import com.sep.sepdrivebackend.service.RideService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ride")
public class RideController {
    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @GetMapping("/active")
    public void getActiveRide() {
        rideService.getRide();
    }

    @PostMapping("/updateRide")
    public void updateRide(@RequestBody RideUpdateDto rideUpdateDTO) {
        rideService.updateRide(rideUpdateDTO);
    }
}

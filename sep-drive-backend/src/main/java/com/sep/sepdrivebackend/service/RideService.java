package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.controller.RideWebSocketController;
import com.sep.sepdrivebackend.dto.RideUpdateDto;
import com.sep.sepdrivebackend.entities.Ride;
import com.sep.sepdrivebackend.entities.RideStatus;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.RideRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class RideService {
    private final RideRepository rideRepository;
    private final RideWebSocketController rideWebSocketController;
    private final UserService userService;

    public RideService(RideRepository rideRepository, RideWebSocketController rideWebSocketController, UserService userService) {
        this.rideRepository = rideRepository;
        this.rideWebSocketController = rideWebSocketController;
        this.userService = userService;
    }

    public void addRide(Ride ride) {
        rideRepository.save(ride);
    }

    public void deleteRide(Long id) {
        if(rideRepository.findById(id).isPresent()) {
            rideRepository.deleteById(id);
        }
    }

    public Ride getRide(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return rideRepository.findRideByUsername(username).orElseThrow();
    }

    public void updateRide(RideUpdateDto rideUpdateDTO) {
        Ride ride = rideRepository.findById(rideUpdateDTO.getRideId()).orElseThrow();
        if(ride.getStatus() == RideStatus.COMPLETED) return;
        if(rideUpdateDTO.isPaused()) ride.setStatus(RideStatus.PAUSED);
        else if(rideUpdateDTO.isResuming()) ride.setStatus(RideStatus.PLAYING);
        else if(rideUpdateDTO.isCompleted()){
            ride.setStatus(RideStatus.COMPLETED);
            rideRepository.save(ride);
            payment(ride);
            //TODO: Save ride to ride history
            rideRepository.delete(ride);
            rideWebSocketController.sendMessage(rideUpdateDTO);
            return;
        }
        ride.setSpeed(rideUpdateDTO.getSpeed());
        ride.setCoords(rideUpdateDTO.getCoords());
        rideRepository.save(ride);
        rideWebSocketController.sendMessage(rideUpdateDTO);
    }

    public void payment(Ride ride){
        User customer = ride.getCustomer();
        User driver = ride.getDriver();
        userService.decreaseBalance(customer.getId(), ride.getPrice());
        userService.increaseBalance(driver.getId(), ride.getPrice());
    }

    public void updateSpeed() {

    }
}

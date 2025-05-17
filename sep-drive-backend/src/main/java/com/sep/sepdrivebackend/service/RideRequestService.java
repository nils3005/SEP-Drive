package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.RideRequestRepository;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class RideRequestService {

    @Autowired
    private RideRequestRepository rideRepo;

    @Autowired
    private UserService userService;

    public RideRequest createRideRequest(RideRequest rideRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userService.findByUsername(username);
        if (customer == null) {
            throw new IllegalStateException("Customer not found");
        }

        boolean hasActiveRide = rideRepo.findByCustomerIdAndActiveTrue(customer.getId()).isPresent();

        if (hasActiveRide) {
            throw new IllegalStateException("You already have an active ride request!");
        }

        rideRequest.setCustomer(customer);
        rideRequest.setActive(true);

        return rideRepo.save(rideRequest);
    }

    public RideRequest getActiveRide() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userService.findByUsername(username);
        if (customer == null) {
            throw new IllegalStateException("Customer not found");
        }

        return rideRepo.findByCustomerIdAndActiveTrue(customer.getId()).orElse(null);
    }

    public void deleteActiveRide() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userService.findByUsername(username);
        if (customer == null) {
            throw new IllegalStateException("Customer not found");
        }

        rideRepo.findByCustomerIdAndActiveTrue(customer.getId()).ifPresent(ride -> {
            ride.setActive(false);
            rideRepo.save(ride);
        });
    }
}

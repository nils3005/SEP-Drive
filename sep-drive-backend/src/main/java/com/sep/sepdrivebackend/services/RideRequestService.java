package com.sep.sepdrivebackend.services;

import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repositories.UserRepository;
import com.sep.sepdrivebackend.repositories.RideRequestRepository;
import org.springframework.stereotype.Service;

@Service
public class RideRequestService {


    private final RideRequestRepository rideRepo;
    private final UserRepository userRepo;

    public RideRequestService(RideRequestRepository rideRepo, UserRepository userRepo)
    {
        this.rideRepo = rideRepo;
        this.userRepo = userRepo;
    }

    public RideRequest createRideRequest(RideRequest rideRequest, Long customerId) {
        User customer = userRepo.findById(customerId)
                .orElseThrow(() -> new IllegalStateException("Customer not found"));

        boolean hasActiveRide = rideRepo.findByCustomerIdAndActiveTrue(customerId).isPresent();

        if (hasActiveRide) {
            throw new IllegalStateException("You already have an active ride request!");
        }

        rideRequest.setCustomer(customer);
        rideRequest.setActive(true);

        return rideRepo.save(rideRequest);
    }

    public RideRequest getActiveRide(Long customerId) {
        return rideRepo.findByCustomerIdAndActiveTrue(customerId).orElse(null);
    }

    public void deleteActiveRide(Long customerId) {
        rideRepo.findByCustomerIdAndActiveTrue(customerId).ifPresent(rideRepo::delete);
    }
}

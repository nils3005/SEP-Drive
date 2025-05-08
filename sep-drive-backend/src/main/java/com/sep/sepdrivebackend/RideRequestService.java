package com.sep.sepdrivebackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RideRequestService {

    @Autowired
    private RideRequestRepository rideRepo;

    // ✅ Create ride request (with check!)
    public RideRequest createRideRequest(RideRequest rideRequest, Long customerId) {
        // Check if customer already has an active ride
        Optional<RideRequest> existingActiveRide = rideRepo.findByCustomerUseridAndActiveTrue(customerId);

        if (existingActiveRide.isPresent()) {
            throw new IllegalStateException("You already have an active ride request!");
        }

        // Set the customer + mark as active
        DriveUser customer = new DriveUser();
        customer.setUserid(customerId);
        rideRequest.setCustomer(customer);
        rideRequest.setActive(true);  // ✅ mark as active

        return rideRepo.save(rideRequest);
    }

    // ✅ Get active ride request
    public RideRequest getActiveRide(Long customerId) {
        return rideRepo.findByCustomerUseridAndActiveTrue(customerId)
                .orElse(null);
    }

    // ✅ Delete (cancel) active ride request
    public void deleteActiveRide(Long customerId) {
        rideRepo.findByCustomerUseridAndActiveTrue(customerId)
                .ifPresent(rideRepo::delete);
    }
}

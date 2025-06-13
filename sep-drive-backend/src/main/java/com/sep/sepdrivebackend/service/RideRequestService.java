package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.dto.RidePriceDto;
import com.sep.sepdrivebackend.dto.RideRequestDto;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.RideRequestRepository;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideRequestService {

    @Autowired
    private RideRequestRepository rideRepo;

    @Autowired
    private UserService userService;

    public List<RideRequestDto> getAllOpenRideRequestsForDriver() {
        List<RideRequestDto> result = new ArrayList<>();
        Long driverId = userService.getCurrentUser().getId();
        rideRepo.findActiveRideRequestsWithoutRejectedOrWithdrawnOfferByDriver(driverId).forEach(rideRequest -> {
            result.add(RideRequestDto.fromEntity(rideRequest));
        });
        return result;
    }

    public RideRequest getRideRequestById(Long id)
    {
        return rideRepo.findById(id).orElse(null);
    }

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
        rideRequest.setCreatedAt(LocalDateTime.now());
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

    public void deactivateCurrentRideRequest() {
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

    public void save(RideRequest rideRequest) {
        rideRepo.save(rideRequest);
    }

    public Optional<RideRequest> findById(Long id) {
        return rideRepo.findById(id);
    }

    public float ridePrice(RidePriceDto ridePriceDto) {
        if(ridePriceDto.getDistance() <= 0) {throw new RuntimeException("Distance must be greater than 0");}
        return switch (ridePriceDto.getCarType().toString()) {
            case "SMALL" -> ridePriceDto.getDistance() / 1000;
            case "MEDIUM" -> ridePriceDto.getDistance() / 1000 * 2;
            default -> ridePriceDto.getDistance() / 1000 * 10;
        };
    }
}

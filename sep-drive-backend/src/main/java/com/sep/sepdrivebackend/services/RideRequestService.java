package com.sep.sepdrivebackend.services;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.repositories.UserRepository;
import com.sep.sepdrivebackend.repositories.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RideRequestService {

    @Autowired
    private RideRequestRepository rideRepo;

    @Autowired
    private UserRepository userRepo;

    public RideRequest createRideRequest(RideRequest rideRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Customer not found"));

        boolean hasActiveRide = rideRepo.findByCustomerIdAndActiveTrue(customer.getId()).isPresent();

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
        rideRepo.findByCustomerIdAndActiveTrue(customerId).ifPresent(ride -> {
            ride.setActive(false);
            rideRepo.save(ride);
        });
    }

    @Service
    public static class UserService {
        private final UserRepository userRepository;

        public UserService(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        public List<User> findAllUsers() {
            return userRepository.findAll();
        }

        public void save(User user) {
            if(user != null && !userRepository.existsById(user.getId())) {
                userRepository.save(user);
            }
        }

        public User findByUserId(Long userID) {
            return userRepository.findById(userID).orElse(null);
        }
    }
}

package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.RideRequestRepository;
import com.sep.sepdrivebackend.repository.UserRepository;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RideRequestService {

    @Autowired
    private RideRequestRepository rideRepo;

    @Autowired /*@Autowired, Spring Boot automatically connects your Service to the Repository*/
    private UserRepository userRepo;/* This connects your code to the UserRepository and only the server can use it */

    public RideRequest createRideRequest(RideRequest rideRequest, Long customerId) {
        /*this method will give us a Riderequest at the end */
        User customer = userRepo.findById(customerId)
                .orElseThrow(() -> new IllegalStateException("Customer not found"));
        /*f the Optional has the User:
It uses the user and keeps processing.
 If it's empty:
It throws an error and stops the process.*/
/*findById do?
It is a ready-made tool that Spring Data JPA gives you.It lets you ask the database”*/

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

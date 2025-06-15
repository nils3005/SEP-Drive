package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.component.GeoJsonRouteParser;
import com.sep.sepdrivebackend.controller.RideWebSocketController;
import com.sep.sepdrivebackend.dto.ActiveRideDto;
import com.sep.sepdrivebackend.dto.RideDto;
import com.sep.sepdrivebackend.dto.RideUpdateDto;
import com.sep.sepdrivebackend.entities.*;
import com.sep.sepdrivebackend.exception.RideNotFoundException;
import com.sep.sepdrivebackend.exception.UserHasRideExcpetion;
import com.sep.sepdrivebackend.repository.RideRepository;
import com.sep.sepdrivebackend.repository.RideRequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideService {
    private final RideRepository rideRepository;
    private final RideWebSocketController rideWebSocketController;
    private final UserService userService;
    private final GeoJsonRouteParser geoJsonRouteParser;
    private final HistoryService historyService;
    private final RideRequestService rideRequestService;
    private final RideRequestRepository rideRequestRepository;

    public RideService(RideRepository rideRepository, RideWebSocketController rideWebSocketController, UserService userService, GeoJsonRouteParser geoJsonRouteParser, HistoryService historyService, RideRequestService rideRequestService, RideRequestRepository rideRequestRepository) {
        this.rideRepository = rideRepository;
        this.rideWebSocketController = rideWebSocketController;
        this.userService = userService;
        this.geoJsonRouteParser = geoJsonRouteParser;
        this.historyService = historyService;
        this.rideRequestService = rideRequestService;
        this.rideRequestRepository = rideRequestRepository;
    }

    @Transactional
    public void addRide(RideDto rideDto) {
        User driver = userService.findByUserId(rideDto.getDriverId());
        User customer = userService.findByUserId(rideDto.getCustomerId());
        if(rideRepository.findRideByUsername(customer.getUsername()).isPresent() || rideRepository.findRideByUsername(driver.getUsername()).isPresent()) {
            throw new UserHasRideExcpetion("One or more users already part of another ride");
        }
        Ride ride = new Ride(driver, customer, rideDto.getSpeed(), rideDto.getPrice(), rideDto.getDistance(), rideDto.getGeoJson(), rideDto.getDuration());
        rideRepository.save(ride);
        RideRequest activeRideRequest = rideRequestService.getActiveRide();
        activeRideRequest.setActive(false);
        rideRequestRepository.save(activeRideRequest);
    }

    //Methode nur zum testen
    public List<Ride> allRides() {
        return rideRepository.findAll();
    }

    @Transactional
    public ActiveRideDto getRide(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Ride ride = rideRepository.findRideByUsername(username).orElseThrow(()->new RideNotFoundException("Ride not found"));
        List<double[]> coords = geoJsonRouteParser.extractCoordinates(ride.getGeoJson());
        List<Double> speeds = geoJsonRouteParser.percentageOfRoute(coords, ride.getDistance());
        return new ActiveRideDto(ride, coords, speeds);
    }

    public void updateRide(RideUpdateDto rideUpdateDTO) {
        Ride ride = rideRepository.findById(rideUpdateDTO.getRideId()).orElseThrow(()->new RideNotFoundException("Ride not found"));
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        if(!ride.getCustomer().getUsername().equals(username) && !ride.getDriver().getUsername().equals(username)) {
            throw new RuntimeException("User is not part of ride");
        }

        if(ride.getStatus() == RideStatus.COMPLETED) return;
        if(rideUpdateDTO.isCompleted()) {
            completeRide(ride, rideUpdateDTO);
        }
        else {
            updateRideStatus(ride, rideUpdateDTO);
            ride.setSpeed(rideUpdateDTO.getSpeed());
            ride.setCoordsIndex(rideUpdateDTO.getCoordsIndex());
            rideRepository.save(ride);
            rideWebSocketController.sendMessage(rideUpdateDTO);
        }
    }

    public void updateIndex(Long rideId, int index) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(()->new RideNotFoundException("Ride not found"));
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        if(!ride.getCustomer().getUsername().equals(username) && !ride.getDriver().getUsername().equals(username)) {
            throw new RuntimeException("User is not part of ride");
        }
        ride.setCoordsIndex(index);
        rideRepository.save(ride);
    }


    public void updateRideStatus(Ride ride, RideUpdateDto rideUpdateDTO) {
        if (rideUpdateDTO.isPaused()) {
            ride.setStatus(RideStatus.PAUSED);
        } else if (rideUpdateDTO.isResuming()) {
            ride.setStatus(RideStatus.PLAYING);
        }
    }

    public void completeRide(Ride ride, RideUpdateDto rideUpdateDTO) {
        ride.setStatus(RideStatus.COMPLETED);
        rideRepository.save(ride);
        payment(ride);

        History history = new History();
        history.setFinishDate(LocalDateTime.now());
        history.setPrice(ride.getPrice());
        history.setDrivenDistance(ride.getDistance());
        history.setDrivenTime(ride.getDuration());
        history.setCustomer(ride.getCustomer());
        history.setDriver(ride.getDriver());

        ride.getCustomer().setNumberOfRides(ride.getCustomer().getNumberOfRides() + 1);
        ride.getDriver().setNumberOfRides(ride.getDriver().getNumberOfRides() + 1);

        historyService.save(history);
        rideUpdateDTO.setHistoryId(history.getHistoryId());

        rideWebSocketController.sendMessage(rideUpdateDTO);
        rideRepository.delete(ride);
    }

    public void payment(Ride ride){
        User customer = ride.getCustomer();
        User driver = ride.getDriver();
        userService.decreaseBalance(customer.getId(), ride.getPrice());
        userService.increaseBalance(driver.getId(), ride.getPrice());
    }
}

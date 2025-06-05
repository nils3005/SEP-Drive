package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.component.GeoJsonRouteParser;
import com.sep.sepdrivebackend.controller.RideWebSocketController;
import com.sep.sepdrivebackend.dto.ActiveRideDto;
import com.sep.sepdrivebackend.dto.RideUpdateDto;
import com.sep.sepdrivebackend.entities.History;
import com.sep.sepdrivebackend.entities.Ride;
import com.sep.sepdrivebackend.entities.RideStatus;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.exception.RideNotFoundException;
import com.sep.sepdrivebackend.exception.UserHasRideExcpetion;
import com.sep.sepdrivebackend.repository.RideRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RideService {
    private final RideRepository rideRepository;
    private final RideWebSocketController rideWebSocketController;
    private final UserService userService;
    private final GeoJsonRouteParser geoJsonRouteParser;
    private final HistoryService historyService;

    public RideService(RideRepository rideRepository, RideWebSocketController rideWebSocketController, UserService userService, GeoJsonRouteParser geoJsonRouteParser, HistoryService historyService) {
        this.rideRepository = rideRepository;
        this.rideWebSocketController = rideWebSocketController;
        this.userService = userService;
        this.geoJsonRouteParser = geoJsonRouteParser;
        this.historyService = historyService;
    }

    public void addRide(Ride ride) {
        User driver = ride.getDriver();
        User customer = ride.getCustomer();
        if(rideRepository.findRideByUsername(customer.getUsername()).isPresent() || rideRepository.findRideByUsername(driver.getUsername()).isPresent()) {
            throw new UserHasRideExcpetion("One or more users already part of another ride");
        }
        rideRepository.save(ride);
    }

    public void deleteRide(Long id) {
        if(rideRepository.findById(id).isPresent()) {
            rideRepository.deleteById(id);
        }
    }

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
        if(rideUpdateDTO.isPaused()) ride.setStatus(RideStatus.PAUSED);
        else if(rideUpdateDTO.isResuming()) ride.setStatus(RideStatus.PLAYING);
        else if(rideUpdateDTO.isCompleted()){
            ride.setStatus(RideStatus.COMPLETED);
            rideRepository.save(ride);
            payment(ride);
            History history = new History();
            history.setFinishDate(LocalDate.now());
            history.setPrice(ride.getPrice());
            history.setDrivenDistance(ride.getDistance());
            history.setDrivenTime(ride.getDuration());
            history.setCustomer(ride.getCustomer());
            history.setDriver(ride.getDriver());
            historyService.save(history);
            rideRepository.delete(ride);
            rideUpdateDTO.setHistoryId(history.getHistoryId());
            rideWebSocketController.sendMessage(rideUpdateDTO);
            return;
        }
        ride.setSpeed(rideUpdateDTO.getSpeed());
        ride.setCoordsIndex(rideUpdateDTO.getCoordsIndex());
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

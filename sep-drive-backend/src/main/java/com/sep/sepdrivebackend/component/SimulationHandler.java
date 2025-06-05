/*package com.sep.sepdrivebackend.component;

import com.sep.sepdrivebackend.controller.RideWebSocketController;
import com.sep.sepdrivebackend.dto.RideDTO;
import com.sep.sepdrivebackend.entities.Ride;
import com.sep.sepdrivebackend.entities.RideStatus;
import com.sep.sepdrivebackend.repository.RideRepository;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class SimulationHandler {

    private final RideRepository rideRepository;
    private final UserService userService;
    private final RideWebSocketController rideWebSocketController;
    private final GeoJsonRouteParser geoJsonRouteParser;

    public SimulationHandler(RideRepository rideRepository, UserService userService, RideWebSocketController rideWebSocketController, GeoJsonRouteParser geoJsonRouteParser) {
        this.rideRepository = rideRepository;
        this.userService = userService;
        this.rideWebSocketController = rideWebSocketController;
        this.geoJsonRouteParser = geoJsonRouteParser;
    }

    public void updateProgress(Ride ride, double progress) {
        ride.setProgress(progress);
        if(progress >= 100){
            ride.setProgress(100);
            ride.setStatus(RideStatus.COMPLETED);
            payment(ride);
        }
        rideRepository.save(ride);

        double[] coords = geoJsonRouteParser.getCoordAtProgress(ride.getRoute(), progress);
        rideWebSocketController.sendMessage(new RideDTO(ride.getId(), ride.getProgress(), ride.getStatus(), coords));
    }

    public void payment(Ride ride){
        //TODO: Implement the payment logic
    }
}*/

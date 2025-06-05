/*package com.sep.sepdrivebackend.component;

import com.sep.sepdrivebackend.controller.RideWebSocketController;
import com.sep.sepdrivebackend.entities.Ride;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Service
public class SimulationScheduler {

    //private final RideWebSocketController rideWebSocketController;
    private final SimulationHandler simulationHandler;
    private final ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(5);
    private final Map<Long, ScheduledFuture<?>> rides  = new HashMap<>();

    public SimulationScheduler(RideWebSocketController rideWebSocketController, SimulationHandler simulationHandler) {
        //this.rideWebSocketController = rideWebSocketController;
        this.simulationHandler = simulationHandler;
    }

    public void startSimulation(Ride ride) {
        long id = ride.getId();
        double speed = ride.getSpeed();
        double stepSize = 100/(speed*10);

        Runnable newRide = new Runnable() {
            double progress = ride.getProgress();
            public void run() {
                if(progress >= 100){
                    cancel(id);
                    return;
                }
                progress += stepSize;
                simulationHandler.updateProgress(ride, progress);
            }
        };

        ScheduledFuture<?> future = scheduledExecutorService.scheduleAtFixedRate(newRide, 0, 100, TimeUnit.MILLISECONDS);
        rides.put(id, future);
    }

    public void pauseSimulation(Ride ride) {
        rides.get(ride.getId()).cancel(false);
    }

    /*public void updateSpeed(Ride ride, double speed) {
        pauseSimulation(ride);
        ride.setSpeed(speed);
    }

    private void cancel(Long id ){
        rides.get(id).cancel(false);
        rides.remove(id);
    }
}*/

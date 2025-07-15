package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.Location;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteOptimizationService {

    public List<Location> getOptimizedWaypoints(Location start, List<Location> waypoints) {
        if (waypoints == null || waypoints.size() <= 1) {
            return waypoints;
        }

        waypoints = removeWaypointsTooFarAway(start, waypoints, 1800.0);
        waypoints = removeDuplicateWaypoints(waypoints);


        waypoints.sort(Comparator.comparingDouble(wp -> haversine(start, wp)));
        return waypoints;
    }

    private double haversine(Location a, Location b) {
        final int R = 6371; // Earth

        double latA = Double.parseDouble(a.getLatitude());
        double latB = Double.parseDouble(b.getLatitude());
        double lonA = Double.parseDouble(a.getLongitude());
        double lonB = Double.parseDouble(b.getLongitude());

        double latDistance = Math.toRadians(latB - latA);
        double lonDistance = Math.toRadians(lonB - lonA);

        double sinLat = Math.sin(latDistance / 2);
        double sinLon = Math.sin(lonDistance / 2);

        double aCalc = sinLat * sinLat +
                Math.cos(Math.toRadians(latA)) *
                        Math.cos(Math.toRadians(latB)) *
                        sinLon * sinLon;

        double c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

        return R * c;
    }

    public List<Location> removeDuplicateWaypoints(List<Location> waypoints) {
        if (waypoints == null) return null;

        return waypoints.stream()
                .distinct()
                .collect(Collectors.toList());
    }

    public List<Location> removeWaypointsTooFarAway(Location start, List<Location> waypoints, double maxDistanceKm) {
        return waypoints.stream()
                .filter(wp -> haversine(start, wp) <= maxDistanceKm)
                .collect(Collectors.toList());
    }

}



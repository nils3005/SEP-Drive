package com.sep.sepdrivebackend.service;
import com.sep.sepdrivebackend.dto.RideRequestForDriverDto;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.RideRequestRepository;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RideRequestService {

    @Autowired
    private RideRequestRepository rideRepo;

    @Autowired
    private UserService userService;

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

    public void deleteActiveRide() {
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

    public List<RideRequest> getAllAvailableRideRequests() {
        return rideRepo.findByActiveTrue();
    }
}
// ===================== NEW CODE STARTS HERE ===================== //

/**
 * Fetches available rides, converts them to DTOs with route info, price calculation,
 * then sorts them by the requested field & order.
 */
public List<RideRequestForDriverDto> getAvailableRideRequestsForDriver(double driverLat, double driverLon,
                                                                       String sortBy, boolean ascending,
                                                                       List<RideRequest> availableRides) {
    List<RideRequestForDriverDto> dtos = availableRides.stream().map(ride -> {
        double distanceToStart = DistanceCalculator.calculateDistance(driverLat, driverLon,
                ride.getStartLocation().getLatitude(), ride.getStartLocation().getLongitude());

        RouteInfo routeInfo = getRouteInfo(
                ride.getStartLocation().getLongitude(), ride.getStartLocation().getLatitude(),
                ride.getDestination().getLongitude(), ride.getDestination().getLatitude()
        );

        double totalDistance = routeInfo.getDistanceKm();
        double totalDuration = routeInfo.getDurationMin();

        double expectedPrice = calculateExpectedPrice(totalDistance, ride.getCarType().name());

        return new RideRequestForDriverDto(
                ride.getId(),
                ride.getCreationTime().toString(),
                distanceToStart,
                ride.getCustomer().getUsername(),
                ride.getCustomer().getRating(),
                ride.getCarType().name(),
                totalDistance,
                totalDuration,
                expectedPrice
        );
    }).collect(Collectors.toList());

    return sortRideRequests(dtos, sortBy, ascending);
}

/**
 * Sort DTO list by field, ascending or descending.
 */
public List<RideRequestForDriverDto> sortRideRequests(List<RideRequestForDriverDto> list, String sortBy, boolean ascending) {
    Comparator<RideRequestForDriverDto> comparator;

    switch (sortBy.toLowerCase()) {
        case "distance":
            comparator = Comparator.comparing(RideRequestForDriverDto::getTotalDistance);
            break;
        case "duration":
            comparator = Comparator.comparing(RideRequestForDriverDto::getTotalDuration);
            break;
        case "price":
            comparator = Comparator.comparing(RideRequestForDriverDto::getExpectedPrice);
            break;
        case "customername":
            comparator = Comparator.comparing(RideRequestForDriverDto::getCustomerName);
            break;
        case "customerrating":
            comparator = Comparator.comparing(RideRequestForDriverDto::getCustomerRating);
            break;
        case "cartype":
            comparator = Comparator.comparing(RideRequestForDriverDto::getCarType);
            break;
        default:
            comparator = Comparator.comparing(RideRequestForDriverDto::getRideId);
    }

    if (!ascending) {
        comparator = comparator.reversed();
    }

    list.sort(comparator);
    return list;
}

/**
 * Calls openrouteservice.org API and parses route distance (km) and duration (min).
 */
private RouteInfo getRouteInfo(double startLon, double startLat, double endLon, double endLat) {
    String requestBody = "{ \"coordinates\": [["
            + startLon + "," + startLat + "],[" + endLon + "," + endLat + "]]}";

    Mono<String> responseMono = webClient.post()
            .header("Authorization", apiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class);

    String response = responseMono.block();

    try {
        org.json.JSONObject json = new org.json.JSONObject(response);
        org.json.JSONArray routes = json.getJSONArray("routes");
        if (routes.length() == 0) throw new RuntimeException("No route found");
        org.json.JSONObject summary = routes.getJSONObject(0).getJSONObject("summary");

        double distanceMeters = summary.getDouble("distance");
        double durationSeconds = summary.getDouble("duration");

        double distanceKm = distanceMeters / 1000.0;
        double durationMin = durationSeconds / 60.0;

        return new RouteInfo(distanceKm, durationMin);

    } catch (Exception e) {
        throw new RuntimeException("Error parsing routing API response: " + e.getMessage(), e);
    }
}

/**
 * Calculate expected price by distance and car type factor.
 */
public double calculateExpectedPrice(double distance, String carType) {
    double factor;
    switch (carType.toLowerCase()) {
        case "small":
            factor = 1.0;
            break;
        case "medium":
            factor = 2.0;
            break;
        case "deluxe":
            factor = 10.0;
            break;
        default:
            throw new IllegalArgumentException("Invalid car type");
    }
    return distance * factor;
}

/**
 * Helper class to hold route info.
 */
private static class RouteInfo {
    private final double distanceKm;
    private final double durationMin;

    public RouteInfo(double distanceKm, double durationMin) {
        this.distanceKm = distanceKm;
        this.durationMin = durationMin;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getDurationMin() {
        return durationMin;
    }
}

// ===================== NEW CODE ENDS HERE ===================== //


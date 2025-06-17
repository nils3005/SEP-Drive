package com.sep.sepdrivebackend.dto;

public class RideRequestForDriverDto {
    private Long rideId;
    private String creationTime;
    private double distanceToStart;
    private String customerName;
    private float customerRating;
    private String carType;
    private double totalDistance;
    private double totalDuration;
    private double expectedPrice;

    public RideRequestForDriverDto() {}

    public RideRequestForDriverDto(Long rideId, String creationTime, double distanceToStart,
                                   String customerName, float customerRating, String carType,
                                   double totalDistance, double totalDuration, double expectedPrice) {
        this.rideId = rideId;
        this.creationTime = creationTime;
        this.distanceToStart = distanceToStart;
        this.customerName = customerName;
        this.customerRating = customerRating;
        this.carType = carType;
        this.totalDistance = totalDistance;
        this.totalDuration = totalDuration;
        this.expectedPrice = expectedPrice;
    }

    // Getters and setters omitted for brevity

    public Long getRideId() {
        return rideId;
    }

    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }

    public String getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(String creationTime) {
        this.creationTime = creationTime;
    }

    public double getDistanceToStart() {
        return distanceToStart;
    }

    public void setDistanceToStart(double distanceToStart) {
        this.distanceToStart = distanceToStart;
    }

    public float getCustomerRating() {
        return customerRating;
    }

    public void setCustomerRating(float customerRating) {
        this.customerRating = customerRating;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCarType() {
        return carType;
    }

    public void setCarType(String carType) {
        this.carType = carType;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public double getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(double totalDuration) {
        this.totalDuration = totalDuration;
    }

    public double getExpectedPrice() {
        return expectedPrice;
    }

    public void setExpectedPrice(double expectedPrice) {
        this.expectedPrice = expectedPrice;
    }
}
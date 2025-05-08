package com.sep.sepdrivebackend;

import com.sep.sepdrivebackend.DriveUser;
import jakarta.persistence.*;

@Entity
public class RideRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private DriveUser customer;

    private String startLocation;
    private String destination;
    private String vehicleClass;
    private boolean active;

    public RideRequest() {}

    public RideRequest(DriveUser customer, String startLocation, String destination, String vehicleClass, boolean active) {
        this.customer = customer;
        this.startLocation = startLocation;
        this.destination = destination;
        this.vehicleClass = vehicleClass;
        this.active = active;
    }

    public Long getId() { return id; }
    public DriveUser getCustomer() { return customer; }
    public void setCustomer(DriveUser customer) { this.customer = customer; }
    public String getStartLocation() { return startLocation; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getVehicleClass() { return vehicleClass; }
    public void setVehicleClass(String vehicleClass) { this.vehicleClass = vehicleClass; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

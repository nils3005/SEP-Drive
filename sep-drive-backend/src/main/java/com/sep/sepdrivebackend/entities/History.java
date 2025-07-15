package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "drive_history")
@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
public class History {

    //no setter needed

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @Column(nullable = false)
    private LocalDateTime finishDate;

    @Column(nullable = false)
    private double drivenDistance;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private float drivenTime; //in Minuten

    //Assoziationen
    @Getter(AccessLevel.NONE)
    @OneToOne(optional = true)
    private Rating ratingCustomer;

    @Getter(AccessLevel.NONE)
    @OneToOne(optional = true)
    private Rating ratingDriver;

    @Getter(AccessLevel.NONE)
    @ManyToOne(optional = false)
    private User customer;

    @Getter(AccessLevel.NONE)
    @ManyToOne(optional = false)
    private User driver;

    //Getter
    public Integer getRatingCustomer() {
        if (ratingCustomer != null) {
            return ratingCustomer.getRating();
        } else {
            return null;
        }
    }

    public Integer getRatingDriver() {
        if (ratingDriver != null) {
            return ratingDriver.getRating();
        } else {
            return null;
        }
    }

    public String getFirstNameCustomer() {
        return customer.getFirstName();
    }

    public String getFirstNameDriver() {
        return driver.getFirstName();
    }

    public String getLastNameCustomer() {
        return customer.getLastName();
    }

    public String getLastNameDriver() {
        return driver.getLastName();
    }

    public String getNameCustomer() { return customer.getFirstName() + " " + customer.getLastName(); }

    public String getNameDriver() { return driver.getFirstName() + " " + driver.getLastName(); }

    public String getUsernameCustomer() {
        return customer.getUsername();
    }

    public String getUsernameDriver() {
        return driver.getUsername();
    }


}


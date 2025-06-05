package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.Ride;
import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, Long> {
    @Query("SELECT r FROM Ride r WHERE r.customer.username = :username or r.driver.username = :username")
    Optional<Ride> findRideByUsername(@Param("username") String username);

    @Query("SELECT r FROM Ride r WHERE r.driver.username = :driver")
    Ride findRideByDriver(@Param("driver") User driver);
}

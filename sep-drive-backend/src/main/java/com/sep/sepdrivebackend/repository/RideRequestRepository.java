package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    // Wenn der Kunde bereits einmal auf die Fahranfrage ein Angebot gesendet hat und abelehnt wurde, dann wird im diese RR nicht mehr angezeigt
    @Query("SELECT r FROM RideRequest r WHERE r.active = true AND NOT EXISTS " +
            "(SELECT 1 FROM RideOffer o WHERE o.rideRequest.id = r.id AND (o.status = 'REJECTED' OR o.status = 'WITHDRAWN'))")
    List<RideRequest> findPendingRideRequestsWithoutRejectedOffers();
    List<RideRequest> findByCustomer(User customer);
    List<RideRequest> findByCustomerAndActiveTrue(User customer);
    Optional<RideRequest> findByCustomerIdAndActiveTrue(Long customerId);
}

package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    // Wenn der Kunde bereits einmal auf die Fahranfrage ein Angebot gesendet hat und abelehnt wurde, dann wird im diese RR nicht mehr angezeigt
    @Query("""
       SELECT r
       FROM   RideRequest r
       WHERE  r.active = TRUE
         AND  NOT EXISTS (
                SELECT 1
                FROM   RideOffer o
                WHERE  o.rideRequest = r
                  AND  o.driver.id   = :driverId
                  AND  o.status      IN ('REJECTED', 'WITHDRAWN')
                  AND r.carType = o.driver.carType
              )
       """)
    List<RideRequest> findActiveRideRequestsWithoutRejectedOrWithdrawnOfferByDriver(
            @Param("driverId") Long driverId);
    List<RideRequest> findByCustomer(User customer);
    List<RideRequest> findByCustomerAndActiveTrue(User customer);
    Optional<RideRequest> findByCustomerIdAndActiveTrue(Long customerId);
}

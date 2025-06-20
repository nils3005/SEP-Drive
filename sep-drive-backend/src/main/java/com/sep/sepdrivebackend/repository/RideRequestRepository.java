package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.CarType;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    /**
     * Wenn der Kunde bereits einmal auf die Fahranfrage ein Angebot gesendet hat und abelehnt wurde, dann wird im diese RR nicht mehr angezeigt
     *
     * @param driverId
     * @param driverCarType
     *
     * @return Liste von RideOffer, die der Fahrer sehen darf - Angebot zu seiner Fahrzeugklasse und offene auf die er
     * noch nicht geboten hat.
     */
    @Query("""
       SELECT r
       FROM   RideRequest r
       WHERE  r.active = TRUE
         AND r.carType = :driverCarType
         AND  NOT EXISTS (
                SELECT 1
                FROM   RideOffer o
                WHERE  o.rideRequest = r
                  AND  o.driver.id   = :driverId
                  AND  o.status      IN ('REJECTED', 'WITHDRAWN')
              )
       """)
    List<RideRequest> findActiveRideRequestsWithoutRejectedOrWithdrawnOfferByDriver(
            @Param("driverId") Long driverId, @Param("driverCarType")CarType driverCarType);

    List<RideRequest> findByCustomer(User customer);

    List<RideRequest> findByCustomerAndActiveTrue(User customer);

    Optional<RideRequest> findByCustomerIdAndActiveTrue(Long customerId);


    List<RideRequest> findByActiveTrue();

}

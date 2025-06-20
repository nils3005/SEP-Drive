package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.RideOffer;
import com.sep.sepdrivebackend.entities.RideOfferStatus;
import com.sep.sepdrivebackend.entities.RideRequest;
import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RideOfferRepository extends JpaRepository<RideOffer, Long> {
    /**
     * Findet alle aktiven bzw. PENDING-Angebote für eine gegebene Fahranfrage.
     */
    List<RideOffer> findByRideRequestAndStatus(RideRequest rideRequest, RideOfferStatus status);

    /**
     * Prüft, ob ein Fahrer bereits ein PENDING-Angebot für exakt diese Anfrage hat.
     */
    Optional<RideOffer> findByDriverAndRideRequestAndStatus(User driver, RideRequest rideRequest, RideOfferStatus status);

    /**
     * Findet alle Angebote eines Fahrers mit Status PENDING (damit er nur eines gleichzeitig haben darf).
     */
    List<RideOffer> findByDriverAndStatus(User driver, RideOfferStatus status);

    /**
     * Wird benutzt, wenn ein Fahrangebot angenommen wird. Setzt die Fahrangebote von den anderen Fahrern auf REJECTED.
     * @param id
     * @return Anzahl der betroffenen Ride Offers
     */
    @Modifying
    @Query("UPDATE RideOffer o SET o.status = 'REJECTED' WHERE o.rideRequest.id = :rideRequestId")
    int rejectAllRideOffersForRideRequest(@Param("rideRequestId") Long id);

    /**
     * Setzt den Status aller PENDING-Angebote auf REJECTED,
     * außer demjenigen, das vom Kunden angenommen wurde.
     */
    @Modifying
    @Query("""
      UPDATE RideOffer o
      SET o.status = :newStatus
      WHERE o.rideRequest = :rideRequest
        AND o.status = :pendingStatus
        AND o.id <> :acceptedOfferId
      """)
    int rejectAllOtherOffers(
            @Param("rideRequest")      RideRequest rideRequest,
            @Param("acceptedOfferId")  Long acceptedOfferId,
            @Param("pendingStatus")    RideOfferStatus pendingStatus,
            @Param("newStatus")        RideOfferStatus newStatus
    );
}

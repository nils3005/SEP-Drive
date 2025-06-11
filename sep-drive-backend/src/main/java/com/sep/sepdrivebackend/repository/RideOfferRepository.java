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
     * Findet Angebote nach Status (z.B. zum Auflisten aller offenen Angebote).
     */
    List<RideOffer> findByStatus(RideOfferStatus status);

    /**
     * Löscht alle Angebote für eine gegebene Fahranfrage anhand der Request-ID.
     */
    @Modifying
    @Query("DELETE FROM RideOffer o WHERE o.rideRequest.id = :rideRequestId")
    int deleteByRideRequestId(@Param("rideRequestId") Long rideRequestId);

    /**
     * Setzt den Status aller PENDING-Angebote auf REJECTED,
     * außer demjenigen, das vom Kunden angenommen wurde.
     */
    @Modifying
    @Query("UPDATE RideOffer o SET o.status = :newStatus WHERE o.rideRequest = :rideRequest AND o.status = 'PENDING' AND o.id <> :acceptedOfferId")
    int rejectAllOtherOffers(@Param("rideRequest") RideRequest rideRequest,
                             @Param("acceptedOfferId") Long acceptedOfferId,
                             @Param("newStatus") RideOfferStatus newStatus);
}

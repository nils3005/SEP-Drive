package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.*;
import com.sep.sepdrivebackend.repository.RideOfferRepository;
import lombok.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@AllArgsConstructor
public class RideOfferService {

    private final RideOfferRepository rideOfferRepository;
    private final UserService userService;
    private final RideRequestService rideRequestService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Fahrer legt ein neues Angebot auf eine Fahranfrage.
     */
    @Transactional
    public RideOffer createOffer(Long driverId, Long rideRequestId) {
        User driver = userService.findByUserId(driverId);
        if(driver == null) {
            throw new ResponseStatusException(NOT_FOUND, "Fahrer nicht gefunden");
        }

        RideRequest rideRequest = rideRequestService.findById(rideRequestId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Fahranfrage nicht gefunden"));

        if (!rideRequest.isActive()) {
            throw new ResponseStatusException(BAD_REQUEST, "Fahranfrage ist nicht mehr aktiv.");
        }

        // Ein Fahrer darf nur genau ein PENDING-Angebot insgesamt haben
        List<RideOffer> existing = rideOfferRepository.findByDriverAndStatus(driver, RideOfferStatus.PENDING);
        if (!existing.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Du hast bereits ein offenes Angebot. Fahrer dürfen nur ein Angebot gleichzeitig haben.");
        }

        // Prüfen, ob Auto des Fahrer auch das gewünschte des Kunden ist
        if(driver.getCarType() != rideRequest.getCarType()) {
            throw new ResponseStatusException(BAD_REQUEST, "Kunde hat CarType " + rideRequest.getCarType() + " bestellt, aber driver hat " + driver.getCarType());
        }

        // Fahrer darf nicht bereits auf dieselbe Request PENDING bieten (wird bereits durch unique constraint abgefangen, aber hier um sicher zu sein).
        rideOfferRepository.findByDriverAndRideRequestAndStatus(driver, rideRequest, RideOfferStatus.PENDING)
                .ifPresent(o -> {
                    throw new ResponseStatusException(BAD_REQUEST, "Du hast bereits ein PENDING-Angebot auf diese Fahranfrage");
                });

        RideOffer rideOffer = RideOffer.builder()
                .driver(driver)
                .rideRequest(rideRequest)
                .status(RideOfferStatus.PENDING)
                .build();

        RideOffer savedOffer =  rideOfferRepository.save(rideOffer);

        // Sende per WebSocket eine Notification an den Kunden, der die Request gestellt hat
        // Alle nötigen Infos in OfferNotificationDto

        // Fahrerstatistiken holen (Rating, totalRides, totalDistance)
        double rating = driver.getRatings().stream().mapToDouble(Rating::getRating).average().orElse(0.0);
        long totalRides = driver.getNumberOfRides();
        double totalDistance = 0.0; //TODO: wie bekommen wir das? Als attribut für jeden user -> dann immer wieder update nach fahrt oder wird der wert immer neu berechnet?

        RideOfferNotificationDto notification = RideOfferNotificationDto.builder()
                .rideOfferId(savedOffer.getId())
                .rideRequestId(rideRequestId)
                .driverId(driverId)
                .driverName(driver.getUsername())
                .description(RideOfferNotificationDescription.NEW_OFFER)
                .build();

        String destination = "/topic/ride-requests/" + rideRequestId + "/offers";
        messagingTemplate.convertAndSend(destination, notification);

        return savedOffer;
    }

    /**
     * Fahrer zieht sein eigenes Angebot zurück (nur wenn Status PENDING).
     */
    @Transactional
    public void withdrawOffer(Long driverId, Long offerId) {
        RideOffer RideOffer = rideOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Angebot nicht gefunden"));

        if (!RideOffer.getDriver().getId().equals(driverId)) {
            throw new ResponseStatusException(FORBIDDEN, "Du darfst nur deine eigenen Angebote zurückziehen");
        }

        if (RideOffer.getStatus() != RideOfferStatus.PENDING) {
            throw new ResponseStatusException(BAD_REQUEST, "Nur PENDING-Angebote können zurückgezogen werden");
        }

        // TODO Kunden WebSocket info

        RideOffer.setStatus(RideOfferStatus.WITHDRAWN);
        rideOfferRepository.save(RideOffer);
    }

    /**
     * Kunde lehnt ein bestimmtes Angebot aktiv ab.
     */
    @Transactional
    public void rejectOffer(Long customerId, Long offerId) {
        RideOffer RideOffer = rideOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Angebot nicht gefunden"));

        RideRequest request = RideOffer.getRideRequest();

        if (!request.getCustomer().getId().equals(customerId)) {
            throw new ResponseStatusException(FORBIDDEN, "Du darfst nur Angebote zu deinen eigenen Fahranfragen verarbeiten");
        }

        if (RideOffer.getStatus() != RideOfferStatus.PENDING) {
            throw new ResponseStatusException(BAD_REQUEST, "Nur PENDING-Angebote können abgelehnt werden");
        }

        RideOffer.setStatus(RideOfferStatus.REJECTED);
        rideOfferRepository.save(RideOffer);
    }

    public int rejectAllOffersForRideRequest(Long rideRequestId) {
        return rideOfferRepository.deleteByRideRequest_Id(rideRequestId);
    }

    /**
     * Kunde nimmt ein bestimmtes Angebot an. Alle anderen PENDING-Angebote
     * derselben Fahranfrage werden automatisch auf REJECTED gesetzt.
     */
    @Transactional
    public RideOffer acceptOffer(Long customerId, Long offerId) {
        RideOffer offerToAccept = rideOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Angebot nicht gefunden"));

        RideRequest rideRequest = offerToAccept.getRideRequest();

        if (!rideRequest.getCustomer().getId().equals(customerId)) {
            throw new ResponseStatusException(FORBIDDEN, "Du darfst nur Angebote zu deinen eigenen Fahranfragen verarbeiten");
        }

        if (offerToAccept.getStatus() != RideOfferStatus.PENDING) {
            throw new ResponseStatusException(BAD_REQUEST, "Nur PENDING-Angebote können angenommen werden");
        }

        // Setze dieses Angebot auf ACCEPTED
        offerToAccept.setStatus(RideOfferStatus.ACCEPTED);
        RideOffer saved = rideOfferRepository.save(offerToAccept);

        // Alle anderen Pending-Angebote für dieselbe Anfrage auf REJECTED setzen
        // count zeigt an, wie viele Records geändert wurden - nur für debugging
        int count = rideOfferRepository.rejectAllOtherOffers(
                rideRequest,
                offerToAccept.getId(),
                RideOfferStatus.REJECTED
        );


        // Notifications an alle betroffenen Fahrer senden,
        // Sendet ACCEPTED_OFFER als Beschreibung. Daraus leitet man im Frontend ab, dass ein User ein bestimmtes Angebot angenommen
        // hat (das Angebot, das auch in der Notification gesetzt ist). Alle anderen Angebote, die nicht gleich der Angebots-Id aus
        // der Notification sind wissen, dass sie abgelehnt wurden. Analog weiß der eine Fahrer, der angenommen wurde,
        // dass er die Fahrt startet.
        RideOfferNotificationDto notification = RideOfferNotificationDto.builder()
                .rideOfferId(offerToAccept.getId())
                .rideRequestId(rideRequest.getId())
                .driverId(offerToAccept.getDriver().getId())
                .driverName(offerToAccept.getDriver().getUsername())
                .description(RideOfferNotificationDescription.ACCEPTED_OFFER)
                .build();

        String destination = "/topic/ride-requests/" + rideRequest.getId() + "/offers";
        messagingTemplate.convertAndSend(destination, notification);

        return saved;
    }

    /**
     * Liefert alle aktuellen PENDING-Angebote für eine gegebene Fahranfrage,
     * inklusive Fahrer-Statistiken (Bewertung, Gesamtstrecke, Anzahl Fahrten).
     */
    @Transactional(readOnly = true)
    public List<RideOffer> getPendingOffersForRequest(Long customerId, Long rideRequestId) {
        RideRequest request = rideRequestService.findById(rideRequestId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Fahranfrage nicht gefunden"));

        if (!request.getCustomer().getId().equals(customerId)) {
            throw new ResponseStatusException(FORBIDDEN, "Du darfst nur Angebote zu deinen eigenen Fahranfragen ansehen");
        }

        return rideOfferRepository.findByRideRequestAndStatus(request, RideOfferStatus.PENDING);
    }

    @Data
    @Builder
    public static class RideOfferNotificationDto {
        private Long rideOfferId;
        private Long rideRequestId;
        private Long driverId;
        private String driverName;
        private RideOfferNotificationDescription description;
    }

    public enum RideOfferNotificationDescription {
        NEW_OFFER, ACCEPTED_OFFER;
    }


}

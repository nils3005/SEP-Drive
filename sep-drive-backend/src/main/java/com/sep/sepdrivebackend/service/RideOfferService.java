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
        if (!rideOfferRepository.findByDriverAndStatus(driver, RideOfferStatus.PENDING).isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Du hast bereits ein offenes Angebot. Fahrer dürfen nur ein Angebot gleichzeitig haben.");
        }

        // Prüfen, ob Auto des Fahrer auch das gewünschte des Kunden ist
        if(driver.getCarType() != rideRequest.getCarType()) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Kunde hat CarType " + rideRequest.getCarType() + " bestellt, aber driver hat " + driver.getCarType());
        }

        // Fahrer darf nicht bereits auf dieselbe Request PENDING bieten
        rideOfferRepository.findByDriverAndRideRequestAndStatus(driver, rideRequest, RideOfferStatus.PENDING)
                .ifPresent(o -> {
                    throw new ResponseStatusException(BAD_REQUEST,
                            "Du hast bereits ein offenes Angebot auf diese Fahranfrage");
                });

        RideOffer rideOffer = RideOffer.builder()
                .driver(driver)
                .rideRequest(rideRequest)
                .status(RideOfferStatus.PENDING)
                .build();

        RideOffer savedOffer =  rideOfferRepository.save(rideOffer);

        // Notification an den Kunden, der die Request erstellt hat
        sendRideOfferNotification("/topic/ride-requests/" + rideRequestId + "/offers", rideRequest.getId(), rideOffer.getId(), driver,
                RideOfferNotificationDescription.NEW_OFFER);

        return savedOffer;
    }

    /**
     * Fahrer zieht sein eigenes Angebot zurück (nur wenn Status PENDING).
     */
    @Transactional
    public void withdrawOfferForRideRequest(Long driverId, Long rideRequestId) {
        RideOffer rideOffer = rideOfferRepository.findByDriverAndRideRequestAndStatus(userService.findByUserId(driverId),
                rideRequestService.getRideRequestById(rideRequestId),
                        RideOfferStatus.PENDING).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Angebot nicht gefunden"));

        if (!rideOffer.getDriver().getId().equals(driverId)) {
            throw new ResponseStatusException(FORBIDDEN, "Du darfst nur deine eigenen Angebote zurückziehen");
        }

        if (rideOffer.getStatus() != RideOfferStatus.PENDING) {
            throw new ResponseStatusException(BAD_REQUEST, "Nur PENDING-Angebote können zurückgezogen werden");
        }

        sendRideOfferNotification("/topic/ride-requests/" + rideRequestId + "/offers", rideOffer.getRideRequest().getId(), rideOffer.getId(), rideOffer.getDriver(),
                RideOfferNotificationDescription.WITHDRAWN_OFFER);

        rideOffer.setStatus(RideOfferStatus.WITHDRAWN);
        rideOfferRepository.save(rideOffer);
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

        // Notification an Driver? topic
        sendRideOfferNotification("/topic/offers/" + offerId,
                request.getId(),
                offerId,
                userService.findByUserId(customerId),
                RideOfferNotificationDescription.REJECTED_OFFER);

        // driver subscriben auf /topic/offer/offerId

        // customer subscriben auf /topic/ride-request/rrId/offers

        RideOffer.setStatus(RideOfferStatus.REJECTED);
        rideOfferRepository.save(RideOffer);
    }

    @Transactional
    public int rejectAllOffersForRideRequest(Long rideRequestId) {
        // TODO lieber auf rejected setzen oder ganz löschen? Es macht keinen Sinn Angebote für eine Fahrt zu speichern, die nicht existiert
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
                RideOfferStatus.PENDING,
                RideOfferStatus.REJECTED
        );

        // Notifications an alle betroffenen Fahrer senden,
        sendRideOfferNotification("/topic/offers/" + offerId, rideRequest.getId(), offerId, offerToAccept.getDriver(),
                RideOfferNotificationDescription.ACCEPTED_OFFER);

        return saved;
    }

    /**
     * Liefert alle aktuellen PENDING-Angebote für eine gegebene Fahranfrage.
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

    private void sendRideOfferNotification(String destination, Long requestId, Long offerId, User driver, RideOfferNotificationDescription desc) {
        RideOfferNotificationDto dto = RideOfferNotificationDto.builder()
                .rideOfferId(offerId)
                .rideRequestId(requestId)
                .driverId(driver.getId())
                .driverName(driver.getUsername())
                .description(desc)
                .build();
        messagingTemplate.convertAndSend(destination, dto);
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
        NEW_OFFER, WITHDRAWN_OFFER, ACCEPTED_OFFER, REJECTED_OFFER;
    }


}

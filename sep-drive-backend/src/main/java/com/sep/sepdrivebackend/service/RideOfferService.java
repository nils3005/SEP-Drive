package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.controller.RideOfferController;
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
        sendRideOfferNotification("/topic/ride-requests/" + rideRequestId + "/offers",
                rideRequest.getId(),
                rideOffer.getId(),
                driver,
                rideRequest.getCustomer().getId(),
                RideOfferNotificationDescription.NEW_OFFER);

        return savedOffer;
    }

    /**
     * Fahrer zieht sein eigenes Angebot zurück (nur wenn Status PENDING).
     */
    @Transactional
    public void withdrawOfferForRideRequest(Long driverId, Long rideRequestId) {
        RideRequest rideRequest = rideRequestService.getRideRequestById(rideRequestId);
        RideOffer rideOffer = rideOfferRepository.findByDriverAndRideRequestAndStatus(userService.findByUserId(driverId),
                rideRequest,
                        RideOfferStatus.PENDING).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Angebot nicht gefunden"));

        if (!rideOffer.getDriver().getId().equals(driverId)) {
            throw new ResponseStatusException(FORBIDDEN, "Du darfst nur deine eigenen Angebote zurückziehen");
        }

        if (rideOffer.getStatus() != RideOfferStatus.PENDING) {
            throw new ResponseStatusException(BAD_REQUEST, "Nur PENDING-Angebote können zurückgezogen werden");
        }

        sendRideOfferNotification("/topic/ride-requests/" + rideRequestId + "/offers",
                rideOffer.getRideRequest().getId(),
                rideOffer.getId(),
                rideOffer.getDriver(),
                rideRequest.getCustomer().getId(),
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

        RideRequest rideRequest = RideOffer.getRideRequest();

        if (!rideRequest.getCustomer().getId().equals(customerId)) {
            throw new ResponseStatusException(FORBIDDEN, "Du darfst nur Angebote zu deinen eigenen Fahranfragen verarbeiten");
        }

        if (RideOffer.getStatus() != RideOfferStatus.PENDING) {
            throw new ResponseStatusException(BAD_REQUEST, "Nur PENDING-Angebote können abgelehnt werden");
        }

        // Notification an Fahrer, dass sein Angebot abgelehnt wurde
        sendRideOfferNotification("/topic/offers/" + offerId,
                rideRequest.getId(),
                offerId,
                userService.findByUserId(customerId),
                rideRequest.getCustomer().getId(),
                RideOfferNotificationDescription.REJECTED_OFFER);

        RideOffer.setStatus(RideOfferStatus.REJECTED);
        rideOfferRepository.save(RideOffer);
    }

    @Transactional
    public int rejectAllOffersForRideRequest(RideRequest rideRequest) {
        for (RideOffer rideOffer : rideRequest.getRideOffers()) {
            // Fahrer Notification, dass Angebot zurückgezogen wurde
            sendRideOfferNotification("/topic/offers/" + rideOffer.getId(),
                    rideRequest.getId(),
                    rideOffer.getId(),
                    rideOffer.getDriver(),
                    rideRequest.getCustomer().getId(),
                    RideOfferNotificationDescription.REJECTED_OFFER);
        }
        return rideOfferRepository.deleteAllRideOffersForRideRequest(rideRequest.getId());
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

        // Notification an alle Fahrer, die auf ein Angebot geboten haben, aber ein anderes akzeptiert wurde
        List<RideOffer> rejected = rideOfferRepository.findByRideRequestAndStatus(rideRequest, RideOfferStatus.REJECTED);
        for (RideOffer rejectedOffer : rejected) {
            sendRideOfferNotification("/topic/offers/" + rejectedOffer.getId(),
                    rideRequest.getId(),
                    rejectedOffer.getId(),
                    offerToAccept.getDriver(),
                    rideRequest.getCustomer().getId(),
                    RideOfferNotificationDescription.REJECTED_OFFER);
        }

        // Notifications an den Fahrer für den der Kunde das Angebot angenommen hat
        sendRideOfferNotification("/topic/offers/" + offerId,
                rideRequest.getId(),
                offerId,
                offerToAccept.getDriver(),
                rideRequest.getCustomer().getId(),
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

    @Transactional
    public RideOffer getPendingOfferForDriver(Long driverId) {
        var offers = rideOfferRepository.findByDriverAndStatus(userService.findByUserId(driverId), RideOfferStatus.PENDING);
        return offers.size() == 1 ? offers.getFirst() : null;
    }

    private void sendRideOfferNotification(String destination, Long requestId, Long offerId, User driver, Long customerId, RideOfferNotificationDescription desc) {
        RideOfferNotificationDto dto = RideOfferNotificationDto.builder()
                .rideOfferId(offerId)
                .rideRequestId(requestId)
                .driverId(driver.getId())
                .driverName(driver.getUsername())
                .customerId(customerId)
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
        private Long customerId;
        private RideOfferNotificationDescription description;
    }

    public enum RideOfferNotificationDescription {
        NEW_OFFER, WITHDRAWN_OFFER, ACCEPTED_OFFER, REJECTED_OFFER;
    }


}

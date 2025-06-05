package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.RideOffer;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.RideOfferService;
import com.sep.sepdrivebackend.service.RideRequestService;
import com.sep.sepdrivebackend.service.UserService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class RideOfferController {
    private final RideOfferService rideOfferService;
    private final UserService userService;
    private final RideRequestService rideRequestService;

    /**
     * Fahrer legt ein neues Angebot an.
     */
    @PostMapping("/offers/{requestId}")
    public ResponseEntity<RideOfferDto> createOfferAsDriver(@PathVariable Long requestId) {
        // ansonsten kann man die driver id auch im json mitgeben
        Long driverId = getCurrentDriverId(); // TODO aus JWT oder SecurityContext
        RideOffer offer = rideOfferService.createOffer(driverId, requestId);
        return ResponseEntity.ok(RideOfferDto.fromEntity(offer));
    }

    /**
     * Fahrer zieht sein Angebot zurück (DELETE).
     */
    @DeleteMapping("/offers/{offerId}")
    public ResponseEntity<Void> withdrawOffer(@PathVariable Long offerId) {
        // Oder wieder mit JSON mit driverid und offerid
        Long driverId = getCurrentDriverId();
        rideOfferService.withdrawOffer(driverId, offerId);
        return ResponseEntity.ok().build();
    }

    /**
     * Kunde listet alle aktuellen PENDING-Angebote zu seiner Fahranfrage.
     * Mit optionalen Query-Parametern zum Sortieren:
     * ?sortBy=rating|totalRides|totalDistance&direction=asc|desc
     */
    @GetMapping("/ride-requests/{rideRequestId}/offers")
    public ResponseEntity<List<RideOfferForCustomerDto>> listOffersForRequest(
            @PathVariable Long rideRequestId,
            @RequestParam(name = "sortBy", required = false, defaultValue = "rating") String sortBy,
            @RequestParam(name = "direction", required = false, defaultValue = "desc") String direction
    ) {
        Long customerId = getCurrentCustomerId();
        List<RideOffer> offers = rideOfferService.getPendingOffersForRequest(customerId, rideRequestId);

        // Baue eine Liste von DTOs, in denen die Fahrer-Statistiken mit drin sind
        List<RideOfferForCustomerDto> dtos = offers.stream()
                .map(offer -> {
                    User driver = offer.getDriver();
                    // Hole Bewertung, Gesamtfahrten, Gesamtstrecke von Driver
                    double rating = driver.getAvgRating();
                    long totalRides = driver.getNumberOfRides();
                    double totalDistance = 0.0; // TODO
                    return RideOfferForCustomerDto.builder()
                            .offerId(offer.getId())
                            .driverId(driver.getId())
                            .driverName(driver.getUsername())
                            .rating(rating)
                            .totalRides(totalRides)
                            .totalDistance(totalDistance)
                            .build();
                })
                .collect(Collectors.toList());

        // Sortieren anhand der Query-Parameter
        Comparator<RideOfferForCustomerDto> comparator = switch (sortBy) {
            case "totalRides" -> Comparator.comparing(RideOfferForCustomerDto::getTotalRides);
            case "totalDistance" -> Comparator.comparing(RideOfferForCustomerDto::getTotalDistance);
            default -> Comparator.comparing(RideOfferForCustomerDto::getRating);
        };

        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }

        dtos.sort(comparator);

        return ResponseEntity.ok(dtos);
    }

    /**
     * Kunde nimmt ein Angebot an.
     */
    @PostMapping("/offers/{offerId}/accept")
    public ResponseEntity<RideOfferDto> acceptOffer(@PathVariable Long offerId) {
        Long customerId = getCurrentCustomerId();
        RideOffer accepted = rideOfferService.acceptOffer(customerId, offerId);
        return ResponseEntity.ok(RideOfferDto.fromEntity(accepted));
    }

    /**
     * Kunde lehnt ein Angebot aktiv ab.
     */
    @PostMapping("/offers/{offerId}/reject")
    public ResponseEntity<Void> rejectOffer(@PathVariable Long offerId) {
        Long customerId = getCurrentCustomerId();
        rideOfferService.rejectOffer(customerId, offerId);
        return ResponseEntity.ok().build();
    }

    private Long getCurrentDriverId() {
        // TODO
        return 1L;
    }

    private Long getCurrentCustomerId() {
        // TODO
        return 1L;
    }

    @Data
    @Builder
    public static class RideOfferDto {
        private Long offerId;
        private Long driverId;
        private Long rideRequestId;
        private String status;

        public static RideOfferDto fromEntity(RideOffer offer) {
            return RideOfferDto.builder()
                    .offerId(offer.getId())
                    .driverId(offer.getDriver().getId())
                    .rideRequestId(offer.getRideRequest().getId())
                    .status(offer.getStatus().name())
                    .build();
        }
    }

    @Data
    @Builder
    public static class RideOfferForCustomerDto {
        private Long offerId;
        private Long driverId;
        private String driverName;
        private double rating;
        private long totalRides;
        private double totalDistance;
        private OffsetDateTime createdAt;
    }
}

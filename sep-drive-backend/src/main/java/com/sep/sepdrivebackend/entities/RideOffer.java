package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
/* Ein Fahrer darf maximal auf eine Anfrage ein Angebot senden. */
@Table(
        name = "offers",
        uniqueConstraints = @UniqueConstraint(columnNames = {"driver_id", "ride_request_id"})
)
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class RideOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Fahrer, der das Angebot gemacht hat.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id")
    private User driver;

    /**
     * Fahranfrage, auf die sich dieses Angebot bezieht.
     */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ride_request_id")
    private RideRequest rideRequest;

    /**
     * Status des Angebots:
     * PENDING = Fahrer hat angeboten, Kunde muss entscheiden.
     * ACCEPTED = Kunde hat angenommen.
     * REJECTED = Kunde hat abgelehnt (oder automatisch abgelehnt, weil ein anderes Angebot angenommen wurde).
     * WITHDRAWN = Fahrer hat sein Angebot zurückgezogen, solange es nicht akzeptiert war.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideOfferStatus status;

}

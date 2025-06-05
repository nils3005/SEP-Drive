package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
/* Ein Fahrer darf maximal auf eine Anfrage ein Angebot senden. */
@Table(name = "offers", uniqueConstraints = @UniqueConstraint(columnNames = {"driver_id", "ride_request_id"}))
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RideOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Fahrer, der das Angebot gemacht hat.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    /**
     * Fahranfrage, auf die sich dieses Angebot bezieht.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_request_id", nullable = false)
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

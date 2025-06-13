package com.sep.sepdrivebackend.Services;


import com.sep.sepdrivebackend.entities.*;
import com.sep.sepdrivebackend.repository.RideOfferRepository;
import com.sep.sepdrivebackend.service.RideOfferService;
import com.sep.sepdrivebackend.service.RideOfferService.RideOfferNotificationDescription;
import com.sep.sepdrivebackend.service.RideRequestService;
import com.sep.sepdrivebackend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static com.sep.sepdrivebackend.entities.RideOfferStatus.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@ExtendWith(MockitoExtension.class)
class RideOfferServiceTest {

    @Mock
    RideOfferRepository rideOfferRepository;
    @Mock
    UserService userService;
    @Mock
    RideRequestService rideRequestService;
    @Mock
    SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    RideOfferService sut;   // SUT = System under test

    private User driver;
    private User customer;
    private RideRequest rideRequest;

    @BeforeEach
    void setUp() {
        driver = new User("driver", "driver@sep.de", "password", Role.DRIVER, "driver", "driver", LocalDate.now());

        customer = new User("customer", "customer@sep.de", "password", Role.CUSTOMER, "customer", "customer", LocalDate.now());

        rideRequest = new RideRequest();
        rideRequest.setId(100L);
        rideRequest.setCarType(CarType.SMALL);
        rideRequest.setActive(true);
    }

    /*****************************************************************
     ** createOffer()
     *****************************************************************/
    @Nested
    class CreateOffer {

        @Test
        void createsOffer_andSendsNotification() {
            // GIVEN
            when(userService.findByUserId(driver.getId())).thenReturn(driver);
            when(rideRequestService.findById(rideRequest.getId())).thenReturn(Optional.of(rideRequest));
            when(rideOfferRepository.findByDriverAndStatus(driver, PENDING)).thenReturn(List.of());

            RideOffer unsaved = RideOffer.builder()
                    .driver(driver)
                    .rideRequest(rideRequest)
                    .status(PENDING)
                    .build();
            RideOffer saved = unsaved;
            saved.setId(999L);
            when(rideOfferRepository.save(any())).thenReturn(saved);

            // WHEN
            RideOffer result = sut.createOffer(driver.getId(), rideRequest.getId());

            // THEN
            assertThat(result).isEqualTo(saved);

            // repository.save wurde mit Offer im Status PENDING aufgerufen
            verify(rideOfferRepository).save(argThat(o ->
                    o.getDriver().equals(driver) &&
                            o.getRideRequest().equals(rideRequest) &&
                            o.getStatus() == PENDING));

            // Notification wurde publiziert
            verify(messagingTemplate).convertAndSend(
                    Optional.ofNullable(eq("/topic/ride-requests/" + rideRequest.getId() + "/offers")),
                    argThat(dto ->
                            dto instanceof RideOfferService.RideOfferNotificationDto notif &&
                                    notif.getRideOfferId() == null            // erst nach save gibt es ID
                                    || dto instanceof RideOfferService.RideOfferNotificationDto));

            verifyNoMoreInteractions(messagingTemplate);
        }

        @Test
        void rejects_ifDriverAlreadyHasPendingOffer() {
            when(userService.findByUserId(driver.getId())).thenReturn(driver);
            when(rideRequestService.findById(rideRequest.getId())).thenReturn(Optional.of(rideRequest));

            // Driver hat schon ein Pending-Offer
            when(rideOfferRepository.findByDriverAndStatus(driver, PENDING))
                    .thenReturn(List.of(RideOffer.builder().id(5L).build()));

            // WHEN / THEN
            assertThatThrownBy(() -> sut.createOffer(driver.getId(), rideRequest.getId()))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting("status")              // org.springframework.http.HttpStatus
                    .isEqualTo(BAD_REQUEST);

            verify(rideOfferRepository, never()).save(any());
            verifyNoInteractions(messagingTemplate);
        }

        @Test
        void fails_ifRideRequestNotFound() {
            when(userService.findByUserId(driver.getId())).thenReturn(driver);
            when(rideRequestService.findById(rideRequest.getId()))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> sut.createOffer(driver.getId(), rideRequest.getId()))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting("status")
                    .isEqualTo(NOT_FOUND);
        }
    }

    /*****************************************************************
     ** withdrawOffer()
     *****************************************************************/
    @Test
    void withdrawOffer_changesStatusAndNotifies() {
        // GIVEN
        RideOffer offer = RideOffer.builder()
                .id(111L)
                .driver(driver)
                .rideRequest(rideRequest)
                .status(PENDING)
                .build();

        when(userService.findByUserId(driver.getId())).thenReturn(driver);
        when(rideRequestService.getRideRequestById(rideRequest.getId())).thenReturn(rideRequest);
        when(rideOfferRepository.findByDriverAndRideRequestAndStatus(driver, rideRequest, PENDING))
                .thenReturn(Optional.of(offer));

        // WHEN
        sut.withdrawOfferForRideRequest(driver.getId(), rideRequest.getId());

        // THEN
        assertThat(offer.getStatus()).isEqualTo(RideOfferStatus.WITHDRAWN);
        verify(rideOfferRepository).save(offer);

        verify(messagingTemplate).convertAndSend(
                Optional.ofNullable(eq("/topic/ride-requests/" + rideRequest.getId() + "/offers")),
                argThat(dto ->
                        dto instanceof RideOfferService.RideOfferNotificationDto notif &&
                                notif.getDescription() == RideOfferNotificationDescription.WITHDRAWN_OFFER)
        );
    }

    /*****************************************************************
     ** acceptOffer()
     *****************************************************************/
    @Test
    void acceptOffer_acceptsOne_rejectsOthers_notifiesAll() {
        // GIVEN
        RideOffer offer1 = RideOffer.builder().id(1L).driver(driver).rideRequest(rideRequest).status(PENDING).build();
        User otherDriver = new User("other", "otherdriver@sep.de", "password", Role.DRIVER, "other", "other", LocalDate.now());
        RideOffer offer2 = RideOffer.builder().id(2L).driver(otherDriver).rideRequest(rideRequest).status(PENDING).build();

        when(rideOfferRepository.findById(offer1.getId())).thenReturn(Optional.of(offer1));

        // save() returning the accepted offer with status ACCEPTED
        ArgumentCaptor<RideOffer> savedCaptor = ArgumentCaptor.forClass(RideOffer.class);
        when(rideOfferRepository.save(savedCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        // reject all other pending offers → simulate update count 1
        when(rideOfferRepository.rejectAllOtherOffers(eq(rideRequest), eq(offer1.getId()), eq(PENDING), eq(RideOfferStatus.REJECTED)))
                .thenReturn(1);

        // after rejectAllOtherOffers() call, repository muss die REJECTED-Offers für Notification liefern
        when(rideOfferRepository.findByRideRequestAndStatus(rideRequest, RideOfferStatus.REJECTED))
                .thenReturn(List.of(offer2));

        // WHEN
        RideOffer result = sut.acceptOffer(customer.getId(), offer1.getId());

        // THEN
        assertThat(savedCaptor.getValue().getStatus()).isEqualTo(RideOfferStatus.ACCEPTED);
        assertThat(result.getStatus()).isEqualTo(RideOfferStatus.ACCEPTED);

        // verify rejectAllOtherOffers called
        verify(rideOfferRepository).rejectAllOtherOffers(rideRequest, offer1.getId(), PENDING, RideOfferStatus.REJECTED);

        // two notifications: one to accepted, one to rejected driver
        verify(messagingTemplate, times(2)).convertAndSend(anyString(), Optional.ofNullable(any()));
    }

    /*****************************************************************
     ** getPendingOffersForRequest()
     *****************************************************************/
    @Test
    void getPendingOffersForRequest_returnsOnlyIfCustomerMatches() {
        when(rideRequestService.findById(rideRequest.getId())).thenReturn(Optional.of(rideRequest));
        when(rideOfferRepository.findByRideRequestAndStatus(rideRequest, PENDING))
                .thenReturn(List.of(
                        RideOffer.builder().id(5L).rideRequest(rideRequest).status(PENDING).build()
                ));

        // correct customer -> list returned
        List<RideOffer> result = sut.getPendingOffersForRequest(customer.getId(), rideRequest.getId());
        assertThat(result).hasSize(1);

        // wrong customer -> 403
        assertThatThrownBy(() -> sut.getPendingOffersForRequest(1234L, rideRequest.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);
    }

    /*****************************************************************
     ** getPendingOfferForDriver()
     *****************************************************************/
    @Test
    void getPendingOfferForDriver_returnsNull_ifNotExactlyOneOffer() {
        // zero
        when(userService.findByUserId(driver.getId())).thenReturn(driver);
        when(rideOfferRepository.findByDriverAndStatus(driver, PENDING))
                .thenReturn(List.of());
        assertThat(sut.getPendingOfferForDriver(driver.getId())).isNull();

        // two
        when(rideOfferRepository.findByDriverAndStatus(driver, PENDING))
                .thenReturn(List.of(
                        RideOffer.builder().id(1L).build(),
                        RideOffer.builder().id(2L).build()
                ));
        assertThat(sut.getPendingOfferForDriver(driver.getId())).isNull();

        // exactly one
        RideOffer only = RideOffer.builder().id(3L).build();
        when(rideOfferRepository.findByDriverAndStatus(driver, PENDING))
                .thenReturn(List.of(only));
        assertThat(sut.getPendingOfferForDriver(driver.getId())).isSameAs(only);
    }
}

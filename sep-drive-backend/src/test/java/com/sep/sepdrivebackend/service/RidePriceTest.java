package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.dto.RidePriceDto;
import com.sep.sepdrivebackend.entities.CarType;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

public class RidePriceTest {

    private static RideRequestService rideRequestService;

    @BeforeAll
    public static void mockDependencies() {
        rideRequestService = new RideRequestService();
    }

    @Test
    public void ridePriceWholeNumber(){
        CarType carType = CarType.MEDIUM;
        float distance = 10000; //meter
        RidePriceDto ridePriceDto = new RidePriceDto(distance, carType);

        double expectedValue = 20;

        double calculatedValue = rideRequestService.ridePrice(ridePriceDto);

        Assertions.assertEquals(expectedValue, calculatedValue);
    }

    @Test
    public void ridePriceDecimalNumber(){
        CarType carType = CarType.MEDIUM;
        float distance = 17193; //meter
        RidePriceDto ridePriceDto = new RidePriceDto(distance, carType);

        double expectedValue = 34.39;

        double calculatedValue = rideRequestService.ridePrice(ridePriceDto);

        Assertions.assertEquals(expectedValue, calculatedValue);
    }

    @Test
    public void ridePriceTooSmallDistance(){
        CarType carType = CarType.MEDIUM;
        float distance = -2; //meter
        RidePriceDto ridePriceDto = new RidePriceDto(distance, carType);

        try{
            rideRequestService.ridePrice(ridePriceDto);
            Assertions.fail();
        } catch (RuntimeException e) {
            Assertions.assertEquals("Distance must be greater than 0", e.getMessage());
        }
    }

}

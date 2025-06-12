package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.CarType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RidePriceDto {
    private float distance;
    private CarType carType;
}

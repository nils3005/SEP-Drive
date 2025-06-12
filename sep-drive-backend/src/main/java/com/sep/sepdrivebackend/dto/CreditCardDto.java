package com.sep.sepdrivebackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreditCardDto {
    private String cardNumber;
    private int expiryDate;
    private String cvc;
}

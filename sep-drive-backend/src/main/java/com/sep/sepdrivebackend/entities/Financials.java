package com.sep.sepdrivebackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "financials")
@Getter @Setter
public class Financials {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long financialsId;

    @Column(nullable = true)
    private Double balance;

    @JsonIgnore
    @Column(nullable = true)
    private String iban; // nur deutsche Konten also keine BIC

    @JsonIgnore
    @Column(nullable = true)
    private String creditCardNumber;

    @JsonIgnore
    @Column(nullable = true)
    private String cvc;

    // YYYYmm
    @Column(nullable = true)
    private Integer expirationDate;

    public String getLastFourIban(){
        if(null == iban) {
            return null;
        }
        return iban.substring(iban.length()-4, iban.length());

    }

    public String getLastFourCreditCardNumber(){
        if(creditCardNumber == null){
            return null;
        }
        return creditCardNumber.substring(creditCardNumber.length()-4, creditCardNumber.length());
    }
}

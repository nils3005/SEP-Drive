package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.BankAccountDto;
import com.sep.sepdrivebackend.dto.CreditCardDto;
import com.sep.sepdrivebackend.entities.Financials;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.FinancialsService;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class FinancialsController {
    private final UserService userService;
    private final FinancialsService financialsService;


    public FinancialsController(UserService userService, FinancialsService financialsService) {
        this.userService = userService;
        this.financialsService = financialsService;
    }

    //Geldkonten
    @PostMapping(path = "/money/addcreditcard")
    public String addCreditCard(@RequestBody CreditCardDto creditCardDto){
        User user = userService.getCurrentUser();
        if(user.getRole()!= Role.CUSTOMER){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no customer.", null);
        }
        if (16 != creditCardDto.getCardNumber().length()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Card number wrong.", null);
        }
        LocalDate now = LocalDate.now();
        int nowInt = now.getYear() * 100 + now.getMonth().getValue();
        if (creditCardDto.getExpiryDate() < nowInt) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Expiry Date exceeded.", null);
        }
        if(3 != creditCardDto.getCvc().length()){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CVC wrong.", null);
        }

        Financials financials = new Financials();
        financials.setCreditCardNumber(creditCardDto.getCardNumber());
        financials.setExpirationDate(creditCardDto.getExpiryDate());
        financials.setCvc(creditCardDto.getCvc());

        user.setFinancials(financials);
        userService.save(user);

        return "Payment info created.";
    }

    @PostMapping (path = "/money/addbankaccount")
    public String addBankAccount(@RequestBody BankAccountDto bankAccountDto){
        User user = userService.getCurrentUser();
        if(user.getRole()!= Role.DRIVER){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no driver.", null);
        }
        if (22 != bankAccountDto.getIban().length()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "IBAN wrong.", null);
        }

        Financials financials = new Financials();
        financials.setIban(bankAccountDto.getIban());
        user.setFinancials(financials);
        userService.save(user);

        return "Payment info created.";
    }

    @PostMapping (path = "/money/deposit/{amount}")
    public String deposit(@PathVariable double amount){
        User user = userService.getCurrentUser();

        if(user.getRole()!= Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no customer.", null);
        }
        Financials financials = user.getFinancials();
        if(null == financials) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Money is null.", null);
        }
        if(financials.getCreditCardNumber() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Credit card number not set.", null);
        }
        LocalDate now = LocalDate.now();
        int nowInt = now.getYear() * 100 + now.getMonth().getValue();
        if (financials.getExpirationDate() < nowInt) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Expiry Date exceeded.", null);
        }
        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too small.", null);
        }
        Double balance = financials.getBalance();
        if (balance == null) {
            balance = 0.0;
        }

        financials.setBalance(balance + amount);
        financialsService.save(financials);

        return "Payment deposited succesfully.";
    }

    @PostMapping (path = "/money/disburse/{amount}")
    public String disburse(@PathVariable double amount){
        User user = userService.getCurrentUser();
        if(user.getRole()!= Role.DRIVER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no driver.", null);
        }
        Financials financials = user.getFinancials();
        if(null == financials) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Money is null.", null);
        }
        if(financials.getIban() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "IBAN not set.", null);
        }
        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too small.", null);
        }
        if (amount > financials.getBalance()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too big, Balance too small.", null);
        }
        financials.setBalance(financials.getBalance() - amount);
        financialsService.save(financials);
        return "Payment disbursed successfully.";
    }

    @PostMapping (path = "/money/transfer/{amount}/{payedTo}")
    public ResponseEntity<String> transfer(@PathVariable double amount, @PathVariable String payedTo){

        User sender = userService.getCurrentUser();
        User receiver = userService.findByUsername(payedTo);
        try {
            financialsService.transfer(sender, receiver, amount);
            return new ResponseEntity<String>("Payment successful.", HttpStatus.OK);

        } catch (IllegalArgumentException e) {

            return new ResponseEntity<String>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

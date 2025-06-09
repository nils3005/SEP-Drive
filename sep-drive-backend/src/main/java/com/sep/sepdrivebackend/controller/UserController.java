package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.BankAccountDto;
import com.sep.sepdrivebackend.dto.CreditCardDto;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
    curl -X GET http://localhost:8080/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = this.userService.findAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    /*
    curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"a\",\"firstName\":\"b\",\"lastName\":\"c\",\"email\":\"d\",\"role\":0,\"carType\":0,\"password\":\"e\",\"birthdate\":\"1234-02-07\"}" http://localhost:8080/users
     */
    @PostMapping("/users")
    public void addUser(@RequestBody User user) {
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found.", null);
        }
        User existing = userService.findByUsername(user.getUsername());
        if ( null != existing ) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken.", null);
        }
        User userForEmail = userService.findByEmail(user.getEmail());
        if (null != userForEmail) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already taken.", null);
        }
        userService.save(user);
    }

    // muss leider so heißen sonst: Ambiguous handler methods mapped for '/users/user'
    @GetMapping("/users/username/{username}")
    public User findByUsername(@PathVariable String username) {
        User user = userService.findByUsername(username);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username not found.", null);
        }
        return user;
    }

    @GetMapping(path = "/users/{userID}")
    public User findByUserId(@PathVariable Long userID) {
        User user = userService.findByUserId(userID);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "UserId not found.", null);
        }
        return user;
    }

    //Geldkonten
    @PostMapping (path = "/users/addcreditcard")
    public String addCreditCard(@RequestBody CreditCardDto creditCardDto){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username not found.", null);
        }
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

        user.setCreditCardNumber(creditCardDto.getCardNumber());
        user.setExpirationDate(creditCardDto.getExpiryDate());
        user.setCvc(creditCardDto.getCvc());
        userService.save(user);

        return "Payment info created.";
    }

    @PostMapping (path = "/users/addbankaccount")
    public String addBankAccount(@RequestBody BankAccountDto bankAccountDto){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username not found.", null);
        }
        if(user.getRole()!= Role.DRIVER){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no driver.", null);
        }
        if (22 != bankAccountDto.getIban().length()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "IBAN wrong.", null);
        }

        user.setIban(bankAccountDto.getIban());
        userService.save(user);

        return "Payment info created.";
    }

    @PostMapping (path = "/users/deposit/{amount}")
    public String deposit(@PathVariable double amount){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username not found.", null);
        }
        if(user.getRole()!= Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no customer.", null);
        }
        if(user.getCreditCardNumber() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Credit card number not set.", null);
        }
        LocalDate now = LocalDate.now();
        int nowInt = now.getYear() * 100 + now.getMonth().getValue();
        if (user.getExpirationDate() < nowInt) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Expiry Date exceeded.", null);
        }
        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too small.", null);
        }
        Double balance = user.getBalance();
        if (balance == null) {
            balance = new Double(0.0);
        }
        user.setBalance(balance + amount);
        userService.save(user);
        return "Payment deposited succesfully.";
    }

    @PostMapping (path = "/users/disburse/{amount}")
    public String disburse(@PathVariable double amount){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username not found.", null);
        }
        if(user.getRole()!= Role.DRIVER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no driver.", null);
        }
        if(user.getIban() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "IBAN not set.", null);
        }
        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too small.", null);
        }
        if (amount > user.getBalance()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too big, Balance too small.", null);
        }
        user.setBalance(user.getBalance() - amount);
        userService.save(user);
        return "Payment disbursed succesfully.";
    }

    @PostMapping (path = "/users/transfer/{amount}/{payedTo}")
    public String transfer(@PathVariable double amount, @PathVariable String payedTo){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userService.findByUsername(username);
        if ( null == sender ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username not found.", null);
        }
        if(sender.getRole()!= Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no customer.", null);
        }
        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too small.", null);
        }
        if (sender.getBalance() == null || amount > sender.getBalance()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Amount too big, Balance too small.", null);
        }
        User receiver = userService.findByUsername(payedTo);
        if (receiver == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username receiver not found.", null);
        }
        if (receiver.getRole() != Role.DRIVER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is no driver, User can not be payed.", null);
        }
        sender.setBalance(sender.getBalance() - amount);
        Double balance = receiver.getBalance();
        if (balance == null) {
            balance = new Double(0.0);
        }
        receiver.setBalance(balance + amount);
        userService.save(sender);
        userService.save(receiver);
        return "Payment successful.";
    }
}

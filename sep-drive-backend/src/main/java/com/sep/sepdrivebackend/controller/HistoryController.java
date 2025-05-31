package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.HistoryDto;
import com.sep.sepdrivebackend.entities.Fahrthistorie;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.FahrthistorienService;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class FahrthistorienController {

    private final FahrthistorienService fahrthistorienService;
    private final UserService userService;

    public FahrthistorienController(FahrthistorienService fahrthistorienService, UserService userService) {
        this.fahrthistorienService = fahrthistorienService;
        this.userService = userService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<Fahrthistorie>> getHistorien() {
        List<Fahrthistorie> fahrthistorien = this.fahrthistorienService.findAllHistorien();
        return ResponseEntity.ok(fahrthistorien);
    }
/*
    @PostMapping("/history/sorted")
    public ResponseEntity<List<Fahrthistorie>> getSortedHistorien(@RequestBody HistoryDto historyDto) {

        List<Fahrthistorie> fahrthistorien = this.fahrthistorienService.findAllHistorien(historyDto.getSortBy(), historyDto.getSortOrder());
        return ResponseEntity.ok(fahrthistorien);
    }
*/
    @PostMapping("/history/{driverID}/{customerID}")
    public ResponseEntity<Long> addFahrthistorie(@PathVariable Long driverID, @PathVariable Long customerID, @RequestBody Fahrthistorie fahrthistorie) {
        if ( null == fahrthistorie) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fahrthistorie not found.", null);
        }
        User driver = userService.findByUserId(driverID);
        if (null == driver) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "DriverID not found.", null);
        }
        User customer = userService.findByUserId(customerID);
        if (null == customer) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CustomerID not found.", null);
        }
        if (Role.DRIVER != driver.getRole()) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Driver is not a Driver", null);
        }
        if (Role.CUSTOMER != customer.getRole()) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Customer is not a Customer", null);
        }
        fahrthistorie.setDriver(driver);
        fahrthistorie.setCustomer(customer);
        fahrthistorienService.save(fahrthistorie);
        return ResponseEntity.ok(fahrthistorie.getFahrthistorieId());
    }
}

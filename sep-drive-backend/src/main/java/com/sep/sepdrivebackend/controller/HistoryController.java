package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.History;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.HistoryService;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.data.domain.Sort;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class HistoryController {

    private final HistoryService historyService;
    private final UserService userService;

    public HistoryController(HistoryService historyService, UserService userService) {
        this.historyService = historyService;
        this.userService = userService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<History>> getHistory() {
        List<History> history = this.historyService.findAllHistory();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/sort/{type}/by/{column}")
    public ResponseEntity<List<History>> getSortedHistory(@PathVariable String type, @PathVariable String column) {
        if ( type == null || column == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parameter missing.", null);
        }
        if (!type.equals("ASC") && !type.equals("DESC")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Sort Order must be ASC or DESC.", null);
        }
        Sort.Direction direction = Sort.Direction.fromString(type);
        Sort sort = Sort.by(direction, column);
        try {
            List<History> history = this.historyService.findAllHistory(sort);
            return ResponseEntity.ok(history);
        } catch (PropertyReferenceException e) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Something went wrong, likely column name", e);
        }
    }

    @PostMapping("/history/{driverID}/{customerID}")
    public ResponseEntity<Long> addHistory(@PathVariable Long driverID, @PathVariable Long customerID, @RequestBody History history) {
        if ( null == history) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "History not found.", null);
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
        history.setDriver(driver);
        history.setCustomer(customer);
        historyService.save(history);
        return ResponseEntity.ok(history.getHistoryId());
    }

    @GetMapping(path = "/history/{historyID}")
    public History findByHistoryId(@PathVariable Long historyID) {
        History history = historyService.findByHistoryId(historyID);
        if ( null == history ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HistoryID not found.", null);
        }
        return history;
    }
}

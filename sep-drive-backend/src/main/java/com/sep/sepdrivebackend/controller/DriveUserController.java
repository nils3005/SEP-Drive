package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.DriveUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class DriveUserController {
    private final DriveUserService driveUserService;

    public DriveUserController(DriveUserService driveUserService) {
        this.driveUserService = driveUserService;
    }

    /*
    curl -X GET http://localhost:8080/driveUsers
     */
    @GetMapping("/users")
    public ResponseEntity<List<DriveUser>> getDriveUsers() {
        List<DriveUser> driveUsers = this.driveUserService.findAllUsers();
        return new ResponseEntity<>(driveUsers, HttpStatus.OK);
    }

    /*
    curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"a\",\"firstName\":\"b\",\"lastName\":\"c\",\"email\":\"d\",\"role\":0,\"carType\":0,\"password\":\"e\",\"birthdate\":\"1234-02-07\"}" http://localhost:8080/driveUsers
     */
    @PostMapping("/driveusers")
    public void addDriveUser(@RequestBody DriveUser driveUser) {
        driveUserService.save(driveUser);
    }


    @GetMapping(path = "/driveusers/{userID}", produces = "application/json")
    public DriveUser findByUserId(@PathVariable Long userID) {
        return driveUserService.findByUserId(userID);
    }

}

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
    @GetMapping("/driveUsers")
    public ResponseEntity<List<DriveUser>> getDriveUsers() {
        List<DriveUser> users = this.driveUserService.findAll();
        ResponseEntity<List<DriveUser>> result = new ResponseEntity<>(users, HttpStatus.OK);
        return result;
    }

    /*
    curl -X POST -H "Content-Type: application/json" -d "{\"userName\":\"a\",\"firstName\":\"b\",\"lastName\":\"c\",\"email\":\"d\",\"dateOfBirth\":20050811,\"numberOfRatings\":0,\"sumOfRatings\":0,\"carType\":0,\"password\":\"e\"}" http://localhost:8080/driveUsers
     */
    @PostMapping("/driveUsers")
    public void addDriveUser(@RequestBody DriveUser driveUser) {
        driveUserService.save(driveUser);
    }

}

package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.DriveUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
    curl -X GET http://localhost:8080/driveUsers
     */
    @GetMapping("/driveUsers")
    public ResponseEntity<List<DriveUser>> getDriveUsers() {
        List<DriveUser> users = this.userService.findAllUsers();
        ResponseEntity<List<DriveUser>> result = new ResponseEntity<>(users, HttpStatus.OK);
        return result;
    }

    /*
    curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"a\",\"firstName\":\"b\",\"lastName\":\"c\",\"email\":\"d\",\"role\":0,\"numberOfRatings\":0,\"sumOfRatings\":0,\"carType\":0,\"password\":\"e\",\"birthdate\":\"1234-02-07\"}" http://localhost:8080/driveUsers
     */
    @PostMapping("/driveUsers")
    public void addDriveUser(@RequestBody DriveUser driveUser) {
        userService.save(driveUser);
    }

}

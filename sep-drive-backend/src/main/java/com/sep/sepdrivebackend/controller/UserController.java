package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.services.RideRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    private final RideRequestService.UserService userService;

    public UserController(RideRequestService.UserService userService) {
        this.userService = userService;
    }

    /*
    curl -X GET http://localhost:8080/driveUsers
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = this.userService.findAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    /*
    curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"a\",\"firstName\":\"b\",\"lastName\":\"c\",\"email\":\"d\",\"role\":0,\"carType\":0,\"password\":\"e\",\"birthdate\":\"1234-02-07\"}" http://localhost:8080/driveUsers
     */
    @PostMapping("/users")
    public void addUser(@RequestBody User user) {
        userService.save(user);
    }


    @GetMapping(path = "/users/{userID}")
    public User findByUserId(@PathVariable Long userID) {
        return userService.findByUserId(userID);
    }

}

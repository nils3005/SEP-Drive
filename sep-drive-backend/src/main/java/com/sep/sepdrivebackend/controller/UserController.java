package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        /*
        User userForEmail = userService.findByEmail(user.getEmail());
        if (userForEmail != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already taken.", null);
        }

         */
        userService.save(user);
    }

    @GetMapping(path = "/users/{userID}")
    public User findByUserId(@PathVariable Long userID) {
        User user = userService.findByUserId(userID);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "UserId not found.", null);
        }
        return user;
    }
}

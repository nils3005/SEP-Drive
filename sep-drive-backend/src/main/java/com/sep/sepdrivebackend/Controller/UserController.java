package com.sep.sepdrivebackend.Controller;

import com.sep.sepdrivebackend.Model.DriveUser;
import com.sep.sepdrivebackend.Service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(path = "/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("")
    public List<DriveUser> findAll() {
        return userService.findAll();
    }

    @GetMapping(path = "/findByName/{username}", produces = "application/json")
    public Optional<DriveUser> findByUsername(@PathVariable String username) {
        return userService.findByUsernamePublic(username);
    }
    @GetMapping(path = "/findById/{userID}", produces = "application/json")
    public DriveUser findById(@PathVariable long userID) {
        return userService.findById(userID);
    }

}

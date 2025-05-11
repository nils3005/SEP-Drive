/*package com.sep.sepdrivebackend.Controller;

import com.sep.sepdrivebackend.Model.User;
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
    public List<User> findAll() {
        return userService.findAll();
    }

    @GetMapping(path = "/findByName/{username}", produces = "application/json")
    public Optional<User> findByUsername(@PathVariable String username) {
        return userService.findByUsernamePublic(username);
    }
    @GetMapping(path = "/findById/{userID}", produces = "application/json")
    public User findById(@PathVariable long userID) {
        return userService.findById(userID);
    }

}*/
package com.sep.sepdrivebackend.Controller;

import com.sep.sepdrivebackend.Model.*;
import com.sep.sepdrivebackend.Service.UserService;
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
        return userService.findByUserId(userID).orElse(null);
    }

}

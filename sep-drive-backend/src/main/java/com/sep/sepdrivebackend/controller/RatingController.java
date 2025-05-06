package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.DriveUser;
import com.sep.sepdrivebackend.entities.Rating;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class RatingController {
    private final RatingService ratingService;
    private final UserService userService;

    public RatingController(RatingService ratingService, UserService userService) {
        this.ratingService = ratingService;
        this.userService = userService;
    }

    /*
    curl -X GET http://localhost:8080/ratings
     */
    @GetMapping("/ratings")
    public ResponseEntity<List<Rating>> getRatings() {
        List<Rating> ratings = this.ratingService.findAllRatings();
        ResponseEntity<List<Rating>> result = new ResponseEntity<>(ratings, HttpStatus.OK);
        return result;
    }

    /*
    curl -X POST -H "Content-Type: application/json" -d "{\"rating\":60.23}" http://localhost:8080/rate/1
     */
    @PostMapping("/rate/{userID}")
    public void addRating(@PathVariable Long userID, @RequestBody Rating rating) {
        DriveUser user = userService.findByUserId(userID);
        rating.setRecipient(user);
        ratingService.save(rating);
    }

}


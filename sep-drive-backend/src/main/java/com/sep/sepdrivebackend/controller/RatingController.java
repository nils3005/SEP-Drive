package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.History;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.Rating;
import com.sep.sepdrivebackend.service.HistoryService;
import com.sep.sepdrivebackend.service.RatingService;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class RatingController {
    private final RatingService ratingService;
    private final UserService userService;
    private final HistoryService historyService;

    public RatingController(RatingService ratingService, UserService userService, HistoryService historyService) {
        this.ratingService = ratingService;
        this.userService = userService;
        this.historyService = historyService;
    }

    /*
     * curl -X GET http://localhost:8080/ratings
     *
     * Zu Testzwecken machen wir das GetMapping
     */
    @GetMapping("/ratings")
    public ResponseEntity<List<Rating>> getRatings() {
        List<Rating> ratings = this.ratingService.findAllRatings();
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }

    /*
     * curl -X POST -H "Content-Type: application/json" -d "{\"rating\":60.23}" http://localhost:8080/rate/1
     */
    @PostMapping("/ratings/{userID}/{historyID}")
    public void addRating(@PathVariable Long userID, @PathVariable Long historyID, @RequestBody Rating rating) {

        User user = userService.findByUserId(userID);
        if (null == user) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "UserID not found.", null);
        }

        String requesterUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (requesterUsername.equals(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User darf sich nicht selbst raten.", null);
        }

        History history = historyService.findByHistoryId(historyID);
        if (null == history) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HistoryID not found.", null);
        }

        boolean requesterIsCustomer = history.getUsernameCustomer().equals(requesterUsername);
        boolean requesterIsDriver = history.getUsernameDriver().equals(requesterUsername);
        boolean targetIsCustomer = history.getUsernameCustomer().equals(user.getUsername());
        boolean targetIsDriver = history.getUsernameDriver().equals(user.getUsername());

        if (requesterIsDriver && targetIsCustomer) {
            if (history.getRatingCustomer()!=null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer has already a rating.", null);
            }
            history.setRatingCustomer(rating);
        } else if (requesterIsCustomer && targetIsDriver) {
            if (history.getRatingDriver()!=null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver has already a rating.", null);
            }
            history.setRatingDriver(rating);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User ist nicht Teil der Fahrt gewesen.", null);
        }
        rating.setUser(user);
        ratingService.save(rating);
    }
}

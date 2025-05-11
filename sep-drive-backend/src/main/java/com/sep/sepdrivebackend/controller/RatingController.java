package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.RatingDTO;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.Rating;
import com.sep.sepdrivebackend.service.RatingService;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    /**
     * Welche Komponente braucht das Mapping?
     */
    @GetMapping("/ratings")
    public ResponseEntity<List<Rating>> getRatings() {
        List<Rating> ratings = this.ratingService.findAllRatings();
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }

    /*
    curl -X POST -H "Content-Type: application/json" -d "{\"rating\":60.23}" http://localhost:8080/rate/1
     */

    /*
     * Wenn man Rating als ResponseBody nimmt, dann erwartet der controller ein User Objekt. Das bedeuetet,
     * dass man für jedes Rating den User mit all seinen Werten im POST übergeben muss. Es reicht aber die ID
     * zu übergeben. Man erstellt ein DTO für Rating und speichert nur die userId anstatt des User als Entity.
     *
     * @PostMapping("/ratings/{userID}")
     *     public void addRating(@PathVariable Long userID, @RequestBody RatingDTO rating) {
     *         User user = userService.findByUserId(userID);
     *         if (user == null) {
     *             throw new ResponseStatusException(HttpStatus.NOT_FOUND, "UserID not found.", null);
     *         }
     *         Rating r = new Rating(user, rating.getRating());
     *         ratingService.save(r);
     *     }
     */
    @PostMapping("/ratings/{userID}")
    public void addRating(@PathVariable Long userID, @RequestBody Rating rating) {
        User user = userService.findByUserId(userID);
        if (null == user) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "UserID not found.", null);
        }
        rating.setUser(user);
        ratingService.save(rating);
    }

}
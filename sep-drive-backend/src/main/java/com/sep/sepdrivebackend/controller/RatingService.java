package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.Rating;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {
    private final RatingRepository ratingRepository;

    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    public List<Rating> findAllRatings() {
        List<Rating> result = ratingRepository.findAll();
        return result;
    }

    public void save(Rating rating) {
        ratingRepository.save(rating);
    }



}

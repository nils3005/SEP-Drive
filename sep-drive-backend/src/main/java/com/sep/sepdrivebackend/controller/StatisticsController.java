package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.StatisticsDto;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class StatisticsController {
    private final UserService userService;

    public StatisticsController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/statistics/daily/{start}/{end}")
    public ResponseEntity<List<StatisticsDto>> getDailyStatistics(@PathVariable long start, @PathVariable long end) {
        User current = userService.getCurrentUser();
        return new ResponseEntity<>(
                userService.getDailyStatistics(
                        current.getId(),
                        start,
                        end),
                HttpStatus.OK);
    }

    @GetMapping("/statistics/monthly/{start}/{end}")
    public ResponseEntity<List<StatisticsDto>> getMonthlyStatistics(@PathVariable long start, @PathVariable long end) {
        User current = userService.getCurrentUser();
        return new ResponseEntity<>(
                userService.getMonthlyStatistics(
                        current.getId(),
                        start,
                        end),
                HttpStatus.OK);
    }
}

package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.LeaderboardDTO;
import com.sep.sepdrivebackend.entities.History;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.HistoryService;
import com.sep.sepdrivebackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class LeaderboardController {
    private final UserService userService;
    private final HistoryService historyService;

    public LeaderboardController(UserService userService, HistoryService historyService) {
        this.userService = userService;
        this.historyService = historyService;
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboard() {
        List<LeaderboardDTO> leaderboardList = userService.getLeaderboard();
        return new ResponseEntity<>(leaderboardList, HttpStatus.OK);
    }

    @GetMapping("/leaderboard2") //Version 1 = ineffizient
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboard2() {

        List <LeaderboardDTO> leaderboardList = new ArrayList<>();
        List<History> history = this.historyService.findAllHistory();
        List<User> user = this.userService.findAllUsers();

        for(User u : user) {
            if (u.getUsername() != null
                    && u.getRole() == Role.DRIVER) {

                leaderboardList.add(new LeaderboardDTO(
                        u.getUsername(),
                        u.getFirstName() + " " + u.getLastName(),
                        0.0,
                        0.0,
                        u.getAvgRating(),
                        u.getNumberOfRides(),
                        0
                ));
            }
        }
        for (History h : history) {
            if(h.getUsernameDriver() != null) {
                for (LeaderboardDTO l: leaderboardList) {
                    if (h.getUsernameDriver().equals(l.getUsername())) {
                        l.setMoney(l.getMoney() + h.getPrice());
                        l.setDriveTime(l.getDriveTime() + h.getDrivenTime());
                        l.setDistance(l.getDistance() + h.getDrivenDistance());
                    }
                }
            }
        }
        return new ResponseEntity<>(leaderboardList, HttpStatus.OK);
    }

}

package com.sep.sepdrivebackend.dto;

import lombok.*;

@Getter
@Setter
@Data
public class LeaderboardDTO {

    private String username;
    private String name;
    private Double distance;
    private Double money;
    private Double rating;
    private long numberOfRides;
    private Double driveTime;

    public LeaderboardDTO(String username, String name, Double distance, Double money, Double rating, long numberOfRides, Double driveTime) {
        this.username = username;
        this.name = name;
        this.distance = distance;
        this.money = money;
        this.rating = rating;
        this.numberOfRides = numberOfRides;
        this.driveTime = driveTime;
    }

    public LeaderboardDTO() {}
}

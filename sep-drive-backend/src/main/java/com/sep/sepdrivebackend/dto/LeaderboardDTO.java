package com.sep.sepdrivebackend.dto;

import lombok.*;

@Getter
@Setter
@Data
public class LeaderboardDTO {

    private String username;
    private String name;
    private double distance;
    private double money;
    private double rating;
    private long numberOfRides;
    private double driveTime;

    public LeaderboardDTO(String username, String name, double distance, double money, double rating, long numberOfRides, double driveTime) {
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

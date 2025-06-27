package com.sep.sepdrivebackend.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Leaderboard {

    private String Username;
    private String Name;
    private double distance;
    private double money;
    private float rating;
    private long numberOfRides;
    private float driveTime;


}

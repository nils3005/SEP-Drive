package com.sep.sepdrivebackend.dto;

import lombok.*;

@Setter @Getter
@Data
@NoArgsConstructor
public class StatisticsDto {
    private long timespan;
    private String username;
    private long drivenRides;
    private Double income;
    private Double drivenDistance;
    private Double drivenTime;
    private Double averageRating;

    public StatisticsDto(String username, long timespan, long drivenRides, Double income, Double drivenDistance, Double drivenTime, Double averageRating) {
        this.timespan = timespan;
        this.drivenRides = drivenRides;
        this.username = username;
        this.income = income;
        this.drivenDistance = drivenDistance;
        this.drivenTime = drivenTime;
        this.averageRating = averageRating;
    }
}

package com.sep.sepdrivebackend.entities;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter @Setter @NoArgsConstructor
public class Location {
    private String latitude;
    private String longitude;
}

package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter @Getter @NoArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter(AccessLevel.NONE)
    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    private float rating;

    public Long getUserID() {
        return user.getId();
    }
}

package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Setter @Getter @NoArgsConstructor @AllArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter(AccessLevel.NONE)
    @ManyToOne
    @JoinColumn(name = "userId") // müsste das nicht user_id sein und nullable = false macht doch auch Sinn
    private User user;

    private float rating;

    public Long getUserID() {
        return user.getId();
    }
}

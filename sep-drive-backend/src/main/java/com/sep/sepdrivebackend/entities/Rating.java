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
    @JoinColumn(name = "user_id")
    private User user;

    private Integer rating;

    public Long getUserID() {
        return user.getId();
    }
}

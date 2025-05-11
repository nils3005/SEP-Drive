/*package com.sep.sepdrivebackend.Model;

import jakarta.persistence.*;

@Entity
public class Rating {
    @Id
    private long ratinID;

    private float ratingValue;

    @ManyToOne
    @JoinColumn(name = "userID")
    private User user;
}*/

package com.sep.sepdrivebackend.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter @Getter @NoArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    private float rating;

}

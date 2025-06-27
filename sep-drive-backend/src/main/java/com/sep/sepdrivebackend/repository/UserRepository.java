package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.dto.LeaderboardDTO;
import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    //@Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findByUsername(String username);

    Optional<User> findById(long userID);

    Optional<User> findByEmail(String email);

    @Query("""
           select new com.sep.sepdrivebackend.dto.LeaderboardDTO(
                u.username,
                concat(u.firstName, ' ', u.lastName),
                sum(h.drivenDistance),
                sum(h.price),
                avg(r.rating),
                u.numberOfRides,
                sum(h.drivenTime)
           )
           from User as u
           left join History as h
           on u.id = h.driver.id
           left join Rating as r
           on h.ratingDriver.id = r.id
           where u.role = 'DRIVER'
           group by 1, 2, 6
           """)
    List<LeaderboardDTO> getLeaderboard();
}

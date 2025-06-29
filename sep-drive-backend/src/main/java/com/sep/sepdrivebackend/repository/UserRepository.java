package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.dto.LeaderboardDTO;
import com.sep.sepdrivebackend.dto.StatisticsDto;
import com.sep.sepdrivebackend.entities.Chat;
import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
           SELECT new com.sep.sepdrivebackend.dto.LeaderboardDTO(
                u.username,
                concat(u.firstName, ' ', u.lastName),
                sum(h.drivenDistance),
                sum(h.price),
                avg(r.rating),
                u.numberOfRides,
                sum(h.drivenTime)
           )
           FROM User AS u
           LEFT JOIN History AS h
           ON u.id = h.driver.id
           LEFT JOIN Rating AS r
           ON h.ratingDriver.id = r.id
           WHERE u.role = 'DRIVER'
           GROUP BY 1, 2, 6
           """)
    List<LeaderboardDTO> getLeaderboard();

    @Query("""
            SELECT new com.sep.sepdrivebackend.dto.StatisticsDto(
                u.username,
                            extract(DAY from h.finishDate)
                    + 100 * extract(MONTH from h.finishDate)
                  + 10000 * extract(YEAR from h.finishDate),
                count(1),
                sum(h.price),
                sum(h.drivenDistance),
                sum(h.drivenTime),
                avg(r.rating)
            )
            FROM User AS u
            LEFT JOIN History AS h
            ON u.id = h.driver.id
            LEFT JOIN Rating AS r
            ON h.ratingDriver.id = r.id
            WHERE u.id = :userid
            AND          extract(DAY from h.finishDate)
               +   100 * extract(MONTH from h.finishDate)
               + 10000 * extract(YEAR from h.finishDate)
            BETWEEN :start AND :end
            GROUP BY 1, 2
            ORDER BY 2 ASC
    """)
    List<StatisticsDto> getDailyStatistics(
            @Param("userid") Long userid,
            @Param("start") Long start,
            @Param("end") Long end);

    @Query("""
            SELECT new com.sep.sepdrivebackend.dto.StatisticsDto(
                u.username,
                extract(MONTH from h.finishDate) + 100 * extract(YEAR from h.finishDate),
                count(1),
                sum(h.price),
                sum(h.drivenDistance),
                sum(h.drivenTime),
                avg(r.rating)
            )
            FROM User as u
            LEFT JOIN History AS h
            on u.id = h.driver.id
            LEFT JOIN Rating as r
            on h.ratingDriver.id = r.id
            where u.id = :userid
            and extract(MONTH from h.finishDate) + 100 * extract(YEAR from h.finishDate) between :start and :end
            group by 1, 2
            ORDER by 2 ASC
    """)
    List<StatisticsDto> getMonthlyStatistics(
            @Param("userid") Long userid,
            @Param("start") Long start,
            @Param("end") Long end);
}

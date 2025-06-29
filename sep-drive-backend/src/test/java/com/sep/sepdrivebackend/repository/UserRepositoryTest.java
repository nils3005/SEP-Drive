package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.dto.LeaderboardDTO;
import com.sep.sepdrivebackend.entities.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@DataJpaTest
public class UserRepositoryTest {
    @Autowired
    UserRepository userRepository; // Instanz des Interfaces (und einer Klasse, die es implementiert ;) )

    @Autowired
    TestEntityManager entityManager;

    @Test
    public void getLeaderboard_Empty() {

        List<LeaderboardDTO> leaderboard = userRepository.getLeaderboard();
        Assertions.assertNotNull(leaderboard);
        Assertions.assertEquals(0, leaderboard.size());
    }

    @Test
    public void getLeaderboard_OneUser_NoFinancials_NoRide_NoRating() {

        User user = new User();
        user.setRole(Role.DRIVER);
        user.setUsername("u_a");
        user.setPassword("p_a");
        user.setFirstName("1_a");
        user.setLastName("2_a");
        user.setEmail("a@b.com");
        user.setCarType(CarType.DELUXE);
        user.setBirthdate(LocalDate.now());

        entityManager.persist(user);

        List<LeaderboardDTO> leaderboard = userRepository.getLeaderboard();
        Assertions.assertNotNull(leaderboard);
        Assertions.assertEquals(1, leaderboard.size());
        Assertions.assertEquals(
                user.getUsername(),
                leaderboard.getFirst().getUsername());
        Assertions.assertEquals(
                user.getFirstName() + " " + user.getLastName(),
                leaderboard.getFirst().getName());
        Assertions.assertNull(leaderboard.getFirst().getDistance());
        Assertions.assertNull(leaderboard.getFirst().getMoney());
        Assertions.assertNull(leaderboard.getFirst().getDriveTime());
        Assertions.assertNull(leaderboard.getFirst().getRating());
        Assertions.assertEquals(0, leaderboard.getFirst().getNumberOfRides());
    }
    @Test
    public void getLeaderboard_OneUser_WithFinancials_NoRide_NoRating() {

        Financials financials = new Financials();
        financials.setBalance(20000.0);
        financials.setIban("DE123456781234");

        User user = new User();
        user.setRole(Role.DRIVER);
        user.setUsername("u_a");
        user.setPassword("p_a");
        user.setFirstName("1_a");
        user.setLastName("2_a");
        user.setEmail("a@b.com");
        user.setCarType(CarType.DELUXE);
        user.setBirthdate(LocalDate.now());
        user.setFinancials(financials);

        entityManager.persist(user);

        List<LeaderboardDTO> leaderboard = userRepository.getLeaderboard();
        Assertions.assertNotNull(leaderboard);
        Assertions.assertEquals(1, leaderboard.size());
        Assertions.assertEquals(
                user.getUsername(),
                leaderboard.getFirst().getUsername());
        Assertions.assertEquals(
                user.getFirstName() + " " + user.getLastName(),
                leaderboard.getFirst().getName());
        Assertions.assertNull(leaderboard.getFirst().getDistance());
        Assertions.assertNull(leaderboard.getFirst().getMoney());
        Assertions.assertNull(leaderboard.getFirst().getDriveTime());
        Assertions.assertNull(leaderboard.getFirst().getRating());
        Assertions.assertEquals(0, leaderboard.getFirst().getNumberOfRides());
    }

    @Test
    public void getLeaderboard_OneUser_NoFinancials_OneRide_NoRating() {

        User customer = new User();
        customer.setRole(Role.CUSTOMER);
        customer.setUsername("u_b");
        customer.setPassword("p_b");
        customer.setFirstName("1_b");
        customer.setLastName("2_b");
        customer.setEmail("b@b.com");
        customer.setBirthdate(LocalDate.now());

        User driver = new User();
        driver.setRole(Role.DRIVER);
        driver.setUsername("u_a");
        driver.setPassword("p_a");
        driver.setFirstName("1_a");
        driver.setLastName("2_a");
        driver.setEmail("a@b.com");
        driver.setCarType(CarType.DELUXE);
        driver.setBirthdate(LocalDate.now());

        History history = new History();
        history.setDriver(driver);
        history.setCustomer(customer);
        history.setPrice(2.0);
        history.setDrivenDistance(30.0);
        history.setDrivenTime(10.0f);
        history.setFinishDate(LocalDateTime.now());

        entityManager.persist(customer);
        entityManager.persist(driver);
        entityManager.persist(history);

        List<LeaderboardDTO> leaderboard = userRepository.getLeaderboard();
        Assertions.assertNotNull(leaderboard);
        Assertions.assertEquals(1, leaderboard.size());
        Assertions.assertEquals(
                driver.getUsername(),
                leaderboard.getFirst().getUsername());
        Assertions.assertEquals(
                driver.getFirstName() + " " + driver.getLastName(),
                leaderboard.getFirst().getName());
        Assertions.assertEquals(
                history.getDrivenDistance(),
                leaderboard.getFirst().getDistance());
        Assertions.assertEquals(
                history.getPrice(),
                leaderboard.getFirst().getMoney());
        Assertions.assertEquals(
                history.getDrivenTime(),
                leaderboard.getFirst().getDriveTime());
        Assertions.assertNull(leaderboard.getFirst().getRating());
        Assertions.assertEquals(0, leaderboard.getFirst().getNumberOfRides());
    }

    // TODO: 2 rides + sum
    // TODO: 1 rating
    // TODO: 2 rating + avg
}

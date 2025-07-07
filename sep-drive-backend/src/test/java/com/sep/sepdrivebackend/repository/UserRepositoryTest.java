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
    public void getLeaderboard_OneUser_NoFinancials_NoRide_NoRating() { //Test mit einem User

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
    }
    @Test
    public void getLeaderboard_OneUser_WithFinancials_NoRide_NoRating() { //zeigt, dass es keine Abhängigkeit zu Financials gibt

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
    }

    @Test
    public void getLeaderboard_OneUser_OneRide_NoRating() {

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
    }

    @Test
    public void getLeaderboard_OneUser_TwoRides_Sum() {

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

        History history2 = new History();
        history2.setDriver(driver);
        history2.setCustomer(customer);
        history2.setPrice(3.0);
        history2.setDrivenDistance(20.0);
        history2.setDrivenTime(10.0f);
        history2.setFinishDate(LocalDateTime.now());

        entityManager.persist(customer);
        entityManager.persist(driver);
        entityManager.persist(history);
        entityManager.persist(history2);

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
                history.getDrivenDistance()+history2.getDrivenDistance(),
                leaderboard.getFirst().getDistance());
        Assertions.assertEquals(
                history.getPrice()+history2.getPrice(),
                leaderboard.getFirst().getMoney());
        Assertions.assertEquals(
                history.getDrivenTime()+history2.getDrivenTime(),
                leaderboard.getFirst().getDriveTime());
        Assertions.assertNull(leaderboard.getFirst().getRating());
    }

    @Test
    public void getLeaderboard_OneUser_OneRide_OneRating() {

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

        Rating rating = new Rating();
        rating.setRating(2);

        history.setRatingDriver(rating);

        entityManager.persist(customer);
        entityManager.persist(driver);
        entityManager.persist(history);
        entityManager.persist(rating);

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
        Assertions.assertEquals(2.0, leaderboard.getFirst().getRating());
    }

    @Test
    public void getLeaderboard_OneUser_TwoRides_TwoRatings() {

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

        History history2 = new History();
        history2.setDriver(driver);
        history2.setCustomer(customer);
        history2.setPrice(3.0);
        history2.setDrivenDistance(20.0);
        history2.setDrivenTime(10.0f);
        history2.setFinishDate(LocalDateTime.now());

        Rating rating = new Rating();
        rating.setRating(4);

        Rating rating2 = new Rating();
        rating2.setRating(2);

        history2.setRatingDriver(rating2);
        history.setRatingDriver(rating);

        entityManager.persist(customer);
        entityManager.persist(driver);
        entityManager.persist(history);
        entityManager.persist(history2);
        entityManager.persist(rating);
        entityManager.persist(rating2);

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
                history.getDrivenDistance()+history2.getDrivenDistance(),
                leaderboard.getFirst().getDistance());
        Assertions.assertEquals(
                history.getPrice()+history2.getPrice(),
                leaderboard.getFirst().getMoney());
        Assertions.assertEquals(
                history.getDrivenTime()+history2.getDrivenTime(),
                leaderboard.getFirst().getDriveTime());
        Assertions.assertEquals(3.0, leaderboard.getFirst().getRating());
    }

    @Test
    public void getLeaderboard_TwoUser_TwoRides_TwoRatings() {

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

        User driver2 = new User();
        driver2.setRole(Role.DRIVER);
        driver2.setUsername("u_c");
        driver2.setPassword("p_c");
        driver2.setFirstName("1_c");
        driver2.setLastName("2_c");
        driver2.setEmail("c@c.com");
        driver2.setCarType(CarType.SMALL);
        driver2.setBirthdate(LocalDate.now());

        History history = new History();
        history.setDriver(driver);
        history.setCustomer(customer);
        history.setPrice(2.0);
        history.setDrivenDistance(30.0);
        history.setDrivenTime(10.0f);
        history.setFinishDate(LocalDateTime.now());

        History history2 = new History();
        history2.setDriver(driver);
        history2.setCustomer(customer);
        history2.setPrice(3.0);
        history2.setDrivenDistance(20.0);
        history2.setDrivenTime(10.0f);
        history2.setFinishDate(LocalDateTime.now());

        Rating rating = new Rating();
        rating.setRating(4);

        Rating rating2 = new Rating();
        rating2.setRating(2);

        history2.setRatingDriver(rating2);
        history.setRatingDriver(rating);

        entityManager.persist(customer);
        entityManager.persist(driver);
        entityManager.persist(driver2);
        entityManager.persist(history);
        entityManager.persist(history2);
        entityManager.persist(rating);
        entityManager.persist(rating2);

        List<LeaderboardDTO> leaderboard = userRepository.getLeaderboard();
        Assertions.assertNotNull(leaderboard);
        Assertions.assertEquals(2, leaderboard.size());

        Assertions.assertEquals(
                driver.getUsername(),
                leaderboard.getFirst().getUsername());
        Assertions.assertEquals(
                driver.getFirstName() + " " + driver.getLastName(),
                leaderboard.getFirst().getName());
        Assertions.assertEquals(
                history.getDrivenDistance()+history2.getDrivenDistance(),
                leaderboard.getFirst().getDistance());
        Assertions.assertEquals(
                history.getPrice()+history2.getPrice(),
                leaderboard.getFirst().getMoney());
        Assertions.assertEquals(
                history.getDrivenTime()+history2.getDrivenTime(),
                leaderboard.getFirst().getDriveTime());
        Assertions.assertEquals(3.0, leaderboard.getFirst().getRating());

        Assertions.assertEquals(
                driver2.getUsername(),
                leaderboard.getLast().getUsername());
        Assertions.assertEquals(
                driver2.getFirstName() + " " + driver2.getLastName(),
                leaderboard.getLast().getName());
        Assertions.assertNull(leaderboard.getLast().getDistance());
        Assertions.assertNull(leaderboard.getLast().getMoney());
        Assertions.assertNull(leaderboard.getLast().getDriveTime());
        Assertions.assertNull(leaderboard.getLast().getRating());
    }

}

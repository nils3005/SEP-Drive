package com.sep.sepdrivebackend.configurations;

import com.sep.sepdrivebackend.entities.*;
import com.sep.sepdrivebackend.repository.HistoryRepository;
import com.sep.sepdrivebackend.repository.RatingRepository;
import com.sep.sepdrivebackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@Configuration
public class DataLoader {


    @Bean
    public CommandLineRunner loadData(UserRepository userRepository, HistoryRepository historyRepository, RatingRepository ratingRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            User driver = new User("driver", "driver@mail.com", passwordEncoder.encode("password"), Role.DRIVER, "John", "Doe", LocalDate.now());
            driver.setCarType(CarType.SMALL);
            User customer = new User("customer", "customer@mail.com", passwordEncoder.encode("password"), Role.CUSTOMER, "Johnny", "Donny", LocalDate.now());
            userRepository.save(driver);
            userRepository.save(customer);

            driver = userRepository.findById(driver.getId()).orElseThrow();
            customer = userRepository.findById(customer.getId()).orElseThrow();

            List<History> histories = new ArrayList<>();

            for (int i = 0; i < 500; i++) {
                History history = new History();

                int year = 2025;
                int month = 1 + ThreadLocalRandom.current().nextInt(12);
                int day = 1 + ThreadLocalRandom.current().nextInt(28);
                history.setFinishDate(LocalDateTime.of(year, month, day, 12, 0));

                history.setDrivenDistance(1 + ThreadLocalRandom.current().nextDouble(100000));
                history.setPrice(history.getDrivenDistance()/1000);
                history.setDrivenTime((float) ((history.getDrivenDistance()/1000)/50*60*60));

                Rating rating = new Rating();
                rating.setUser(driver);
                rating.setRating(1 + ThreadLocalRandom.current().nextInt(5));
                rating = ratingRepository.save(rating);

                history.setRatingDriver(rating);
                history.setCustomer(customer);
                history.setDriver(driver);

                histories.add(history);
            }

            historyRepository.saveAll(histories);
        };
    }
}

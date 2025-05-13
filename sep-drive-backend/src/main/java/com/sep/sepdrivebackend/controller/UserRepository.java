package com.sep.sepdrivebackend.repositories;

import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
/* user repository is like a worker for youto bring things from the data base  */
public interface UserRepository extends JpaRepository<User, Long> {
    /*We use an interface for the repository because Spring Boot makes the code for us, so spring bot
    not onlz get access to teh database but it also write the code*/
    /*JPa repository:It connects your Java code (User entity) to your database table (drive_users) and do
    whatever we want deletd find from teh database .*/
    /*<User, Long> like zou are saying We are working with User objects, and each one has a Long as its ID.”."*/
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    /*These methods are NOT automatic—you have to write them yourself, like you did.*/
}

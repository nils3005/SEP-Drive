package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    //@Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findByUsername(String username);

    Optional<User> findById(long userID);

    Optional<User> findByEmail(String email);
}

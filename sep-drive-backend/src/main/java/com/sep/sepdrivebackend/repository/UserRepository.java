package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    //Optional<User> findByUsername(String username); dann braucht man die eigene Implementierung im Service nicht weil es automatisch generiert wird
    Optional<User> findByEmail(String email);
}

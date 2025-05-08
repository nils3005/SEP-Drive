package com.sep.sepdrivebackend;

import com.sep.sepdrivebackend.DriveUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DriveUserRepository extends JpaRepository<DriveUser, Long> {
    Optional<DriveUser> findByUsername(String username);
}

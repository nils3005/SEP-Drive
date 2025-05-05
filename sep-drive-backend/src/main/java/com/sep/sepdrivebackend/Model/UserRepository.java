package com.sep.sepdrivebackend.Model;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<DriveUser, Long> {

    @Query("SELECT u FROM DriveUser u WHERE u.username = :username")
    Optional<DriveUser> findByUsername(@Param("username") String username);

    @Query("SELECT u FROM DriveUser u WHERE u.userID = :userID")
    DriveUser findById(@Param("userID") long userID);

    Optional<DriveUser> findByEmail(String email);

}

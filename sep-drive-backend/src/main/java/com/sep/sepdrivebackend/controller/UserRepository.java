package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.DriveUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



@Repository
public interface UserRepository extends JpaRepository<DriveUser, Long> {
    @Query("SELECT u FROM DriveUser u WHERE u.userID = :userID")
    DriveUser findByUserId(@Param("userID") long userID);

}

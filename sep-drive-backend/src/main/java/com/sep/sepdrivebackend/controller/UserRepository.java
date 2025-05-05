package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.DriveUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface UserRepository extends JpaRepository<DriveUser, Long> {

}

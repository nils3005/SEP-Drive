package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.DriveUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriveUserService {
    private final DriveUserRepository driveUserRepository;

    public DriveUserService(DriveUserRepository driveUserRepository) {
        this.driveUserRepository = driveUserRepository;
    }

    public List<DriveUser> findAllUsers() {
        return driveUserRepository.findAll();
    }

    public void save(DriveUser driveUser) {
        driveUserRepository.save(driveUser);
    }

    public DriveUser findByUserId(Long userID) {
        return driveUserRepository.findById(userID).orElse(null);
    }

}

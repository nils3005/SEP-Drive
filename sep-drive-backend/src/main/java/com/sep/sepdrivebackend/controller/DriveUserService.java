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

    public List<DriveUser> findAll() {
        List<DriveUser> result = driveUserRepository.findAll();
        return result;
    }

    public void save(DriveUser driveUser) {


        driveUserRepository.save(driveUser);
    }



}

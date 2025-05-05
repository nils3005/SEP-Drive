package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.DriveUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<DriveUser> findAllUsers() {
        List<DriveUser> result = userRepository.findAll();
        return result;
    }

    public void save(DriveUser driveUser) {
        userRepository.save(driveUser);
    }



}

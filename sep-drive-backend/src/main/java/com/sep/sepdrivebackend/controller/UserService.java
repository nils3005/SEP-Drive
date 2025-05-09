package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public void save(User user) {
        if(user != null && !userRepository.existsById(user.getId())) {
            userRepository.save(user);
        }
    }

    public User findByUserId(Long userID) {
        return userRepository.findById(userID).orElse(null);
    }

}

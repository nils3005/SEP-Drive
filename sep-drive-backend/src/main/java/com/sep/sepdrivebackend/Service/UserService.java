package com.sep.sepdrivebackend.Service;

import com.sep.sepdrivebackend.Model.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        if(user != null/* && !userRepository.existsById(user.getId())*/) {
            userRepository.save(user);
        }
    }

    public User findByUserId(Long userID) {
        return userRepository.findById(userID).orElse(null);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}

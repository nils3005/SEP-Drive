package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.repository.UserRepository;
import com.sep.sepdrivebackend.entities.User;
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
        userRepository.save(user);
    }

    public User findByUserId(Long userID) {
        return userRepository.findById(userID).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public void increaseBalance(Long id, Double amount) {}

    public void decreaseBalance(Long id, Double amount) {}
}

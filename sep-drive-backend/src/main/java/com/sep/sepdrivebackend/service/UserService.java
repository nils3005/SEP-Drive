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

    // Braucht man nicht, wenn man die Zeile im UserRepo nimmt
    public User findByUsername(String username) {
        return findAllUsers()
                .stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst().orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}

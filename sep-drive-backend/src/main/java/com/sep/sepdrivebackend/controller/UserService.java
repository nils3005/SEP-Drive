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
        if ( null == user ) {
            return;
        }
        if ( null == user.getId() ) {

            // New user? Check if username already taken!
            User existing = findByUsername(user.getUsername());

            // Username taken, abort.
            if ( null != existing ) {
                return;
            }
        }
       userRepository.save(user);
    }

    public User findByUserId(Long userID) {
        return userRepository.findById(userID).orElse(null);
    }

    public User findByUsername(String username) {

        return findAllUsers()
                .stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst().orElse(null);
    }
}

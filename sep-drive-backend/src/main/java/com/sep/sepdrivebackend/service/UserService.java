package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.Rating;
import com.sep.sepdrivebackend.repository.UserRepository;
import com.sep.sepdrivebackend.entities.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    /*public void giveRating(User user, float rating){
        Rating newRating = new Rating();
        newRating.setUser(user);
        newRating.setRating(rating);
        user.getRatings().add(newRating);
        userRepository.save(user);
    }*/

    public void increaseBalance(Long id, float amount) {}

    public void decreaseBalance(Long id, float amount) {}

    public User getCurrentUser(){
        String username = getCurrentUserName();
        User user = findByUsername(username);
        if ( null == user ) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Username not found.", null);
        }
        return user;
    }

    public String getCurrentUserName() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}

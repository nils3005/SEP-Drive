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

   public List<User> findAll() {
       return (List<User>) userRepository.findAll();
   }

   public Optional<User> findByUsername(String username) {
       return userRepository.findByUsername(username);
   }

   public Optional<User> findByUsernamePublic(String username) {
       Optional<User> user = findByUsername(username);
       if (user.isPresent()) {
           user.get().setPassword(null);
           user.get().setVerificationCode(null);
       }
       return user;
   }

   public User findById(long userID) {
       return userRepository.findById(userID);
   }

   public void save(User user) {
       userRepository.save(user);
   }
}

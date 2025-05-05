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

   public List<DriveUser> findAll() {
       return (List<DriveUser>) userRepository.findAll();
   }

   public Optional<DriveUser> findByUsername(String username) {
       return userRepository.findByUsername(username);
   }

   public Optional<DriveUser> findByUsernamePublic(String username) {
       Optional<DriveUser> user = findByUsername(username);
       if (user.isPresent()) {
           user.get().setPassword(null);
           user.get().setVerificationCode(null);
       }
       return user;
   }

   public DriveUser findById(long userID) {
       return userRepository.findById(userID);
   }

   public void save(DriveUser driveUser) {
       userRepository.save(driveUser);
   }
}

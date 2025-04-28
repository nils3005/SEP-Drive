package com.sep.sepdrivebackend.Service;

import com.sep.sepdrivebackend.Model.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
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
   public Optional<PublicUser> findByUsernamePublic(String username) {
       String userInformation = userRepository.findByUsernamePublic(username);
       if(userInformation == null) {
           return Optional.empty();
       }
       String[] information = userInformation.split(",");
       CarType carTypeOfUser = null;
       if(!information[9].equals("null")) carTypeOfUser = CarType.valueOf(information[9]);
       PublicUser user = new PublicUser(information[0], Role.valueOf(information[1]), information[2], information[3], information[4], information[5], information[6], Float.parseFloat(information[7]), Integer.parseInt(information[8]), carTypeOfUser);
       return Optional.of(user);
   }

   public DriveUser findById(long userID) {
       return userRepository.findById(userID);
   }

   public void save(DriveUser user) {
       userRepository.save(user);
   }
}

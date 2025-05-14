package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.dto.LoginDto;
import com.sep.sepdrivebackend.dto.RegisterDto;
import com.sep.sepdrivebackend.dto.VerifyDto;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.exception.*;
import com.sep.sepdrivebackend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    @Value("${mail.supersecretcode}")
    private String SUPERSECRETCODE;

    public void checkUsername(String username){
        User user = userService.findByUsername(username);
        if(user == null){throw new UserNotFoundException("Username doesnt exist!");}
    }

    public void login(LoginDto loginDto) {
        User user = userService.findByUsername(loginDto.getUsername());
        if(user == null) {throw new UserNotFoundException("Username doesnt exist!");}
        if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {throw new WrongCredentialsException("Wrong password!");}
        user.setVerificationCode(generateCode());
        userService.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
    }

    public void registerUser(RegisterDto registerDto) {
        if (userService.findByEmail(registerDto.getEmail()) != null) {
            throw new EmailAlreadyUsedException("Email already in use");
        }
        if(userService.findByUsername(registerDto.getUsername()) != null){
            throw new UsernameAlreadyUsedException("Username already in use");
        }
        if(registerDto.getUsername().isEmpty() || registerDto.getPassword().isEmpty() || registerDto.getEmail().isEmpty() ||  registerDto.getRole() == null || registerDto.getFirstName().isEmpty() || registerDto.getLastName().isEmpty() || registerDto.getBirthDate().isEmpty()) {
            throw new IncompleteFieldException("Please fill all the required fields with valid data");
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate localDate = LocalDate.parse(registerDto.getBirthDate(), formatter);
        User user = new User(registerDto.getUsername(),
                registerDto.getEmail(),
                passwordEncoder.encode(registerDto.getPassword()),
                registerDto.getRole(),
                registerDto.getFirstName(),
                registerDto.getLastName(),
                localDate);
        if(user.getRole() == Role.DRIVER && registerDto.getCarType() == null) {
            throw new IncompleteFieldException("Car type is required");
        }
        if(user.getRole() == Role.DRIVER){
            user.setCarType(registerDto.getCarType());
        }
        if(registerDto.getProfilePicture() != null){
            String pb = registerDto.getProfilePicture();
            byte[] decodedBytes = Base64.getDecoder().decode(pb);
            user.setProfilePicture(decodedBytes);
        }
        userService.save(user);
    }

    public String verifyEmail(VerifyDto verifyDto) {
        User user = userService.findByUsername(verifyDto.getUsername());
        if(user == null) {throw new UserNotFoundException("Username doesnt exist!");}
        if(user.getVerificationCode() == null){ throw new RuntimeException("Please log in first!");}
        if(!user.getVerificationCode().equals(verifyDto.getCode()) && !verifyDto.getCode().equals(SUPERSECRETCODE)){throw new WrongCredentialsException("Wrong verification code!");}
        user.setVerificationCode(null);
        user.setTokenId(user.getTokenId()+1);
        userService.save(user);

        return jwtService.generateToken(user.getUsername());
    }

    public void incrementTokenId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);
        if(user == null) {throw new RuntimeException("Username already logged out!");}
        int newTokenId = user.getTokenId()+1;
        user.setTokenId(newTokenId);
        userService.save(user);
    }


    private String generateCode() {
        Random random = new Random();
        int code = 1000 + random.nextInt(9000);
        return String.valueOf(code);
    }
}

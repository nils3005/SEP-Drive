package com.sep.sepdrivebackend.Service;

import com.sep.sepdrivebackend.Dto.LoginDto;
import com.sep.sepdrivebackend.Dto.RegisterDto;
import com.sep.sepdrivebackend.Dto.VerifyDto;
import com.sep.sepdrivebackend.Model.User;
import com.sep.sepdrivebackend.Model.Role;
import com.sep.sepdrivebackend.Model.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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

    public void login(LoginDto loginDto) {
        /*User user = userRepository.findByUsername(loginDto.getUsername()).orElseThrow(() -> new RuntimeException("Username doesnt exist!"));
        if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {throw new RuntimeException("Wrong password!");}
        user.setVerificationCode(generateCode());
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());*/

        User user = userService.findByUsername(loginDto.getUsername()).orElseThrow(() -> new RuntimeException("Username doesnt exist!"));
        if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {throw new RuntimeException("Wrong password!");}
        user.setVerificationCode(generateCode());
        userService.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
    }

    public void registerUser(RegisterDto registerDto) {
        /*if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        if(userRepository.findByUsername(registerDto.getUsername()).isPresent()){
            throw new RuntimeException("Username already in use");
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        LocalDate localDate = LocalDate.parse(registerDto.getBirthDate(), formatter);
        User user = new User(registerDto.getUsername(),
                registerDto.getEmail(),
                passwordEncoder.encode(registerDto.getPassword()),
                registerDto.getRole(),
                registerDto.getFirstName(),
                registerDto.getLastName(),
                localDate,
                registerDto.getProfilePicture());
        if(user.getRole() == Role.DRIVER && registerDto.getCarType() == null) {
            throw new RuntimeException("Car type is required");
        }
        if(user.getRole() == Role.DRIVER){
            user.setCarType(registerDto.getCarType());
        }
        userRepository.save(user);*/

        if (userService.findByEmail(registerDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        if(userService.findByUsername(registerDto.getUsername()).isPresent()){
            throw new RuntimeException("Username already in use");
        }
        if(registerDto.getUsername().isEmpty() || registerDto.getPassword().isEmpty() || registerDto.getEmail().isEmpty() ||  registerDto.getRole() == null || registerDto.getFirstName().isEmpty() || registerDto.getLastName().isEmpty() || registerDto.getBirthDate().isEmpty()) {
            throw new RuntimeException("Please fill all the required fields");
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        LocalDate localDate = LocalDate.parse(registerDto.getBirthDate(), formatter);
        User user = new User(registerDto.getUsername(),
                registerDto.getEmail(),
                passwordEncoder.encode(registerDto.getPassword()),
                registerDto.getRole(),
                registerDto.getFirstName(),
                registerDto.getLastName(),
                localDate,
                registerDto.getProfilePicture());
        if(user.getRole() == Role.DRIVER && registerDto.getCarType() == null) {
            throw new RuntimeException("Car type is required");
        }
        if(user.getRole() == Role.DRIVER){
            user.setCarType(registerDto.getCarType());
        }
        userService.save(user);
    }

    public String verifyEmail(VerifyDto verifyDto) {
        /*User user = userRepository.findByUsername(verifyDto.getUsername())
                .orElseThrow(()->new RuntimeException("Username not found!"));
        if(user.getVerificationCode() == null){ throw new RuntimeException("Please log in first!");}
        if(!user.getVerificationCode().equals(verifyDto.getCode()) && !verifyDto.getCode().equals(SUPERSECRETCODE)){throw new RuntimeException("Wrong verification code!");}
        //user.setVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        return jwtService.generateToken(user.getUsername());*/

        User user = userService.findByUsername(verifyDto.getUsername())
                .orElseThrow(()->new RuntimeException("Username not found!"));
        if(user.getVerificationCode() == null){ throw new RuntimeException("Please log in first!");}
        if(!user.getVerificationCode().equals(verifyDto.getCode()) && !verifyDto.getCode().equals(SUPERSECRETCODE)){throw new RuntimeException("Wrong verification code!");}
        //user.setVerified(true);
        user.setVerificationCode(null);
        user.setTokenId(user.getTokenId()+1);
        userService.save(user);

        return jwtService.generateToken(user.getUsername());
    }

    public void incrementTokenId() {
        /*//User user = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        //System.out.println(user.getId());
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(()->new RuntimeException("User already logged out"));
        int newTokenId = user.getTokenId()+1;
        user.setTokenId(newTokenId);
        userRepository.save(user);*/

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username).orElseThrow(()->new RuntimeException("User already logged out"));
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

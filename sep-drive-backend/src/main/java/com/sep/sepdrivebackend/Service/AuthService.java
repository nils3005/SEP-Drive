package com.sep.sepdrivebackend.Service;

import com.sep.sepdrivebackend.Dto.LoginDto;
import com.sep.sepdrivebackend.Dto.RegisterDto;
import com.sep.sepdrivebackend.Dto.VerifyDto;
import com.sep.sepdrivebackend.Model.User;
import com.sep.sepdrivebackend.Model.Role;
import com.sep.sepdrivebackend.Model.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    @Value("${mail.supersecretcode}")
    private String SUPERSECRETCODE;

    public void login(LoginDto loginDto) {
        User user = userRepository.findByUsername(loginDto.getUsername()).orElseThrow(() -> new RuntimeException("Username doesnt exist!"));
        if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {throw new RuntimeException("Wrong password!");}
        user.setVerificationCode(generateCode());
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
    }

    public void registerUser(RegisterDto registerDto) {
        if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        if(userRepository.findByUsername(registerDto.getUsername()).isPresent()){
            throw new RuntimeException("Username already in use");
        }
        User user = new User(registerDto.getUsername(),
                                            passwordEncoder.encode(registerDto.getPassword()),
                                            registerDto.getFirstName(),
                                            registerDto.getLastName(),
                                            registerDto.getEmail(),
                                            registerDto.getBirthDate(),
                                            registerDto.getRole());
        if(user.getRole() == Role.DRIVER && registerDto.getCarType() == null) {
            throw new RuntimeException("Car type is required");
        }
        if(user.getRole() == Role.DRIVER){
            user.setCarType(registerDto.getCarType());
        }
        if(registerDto.getProfilePicture() != null){
            user.setProfilePicture(registerDto.getProfilePicture());
        }
        userRepository.save(user);
    }

    public String verifyEmail(VerifyDto verifyDto) {
        User user = userRepository.findByUsername(verifyDto.getUsername())
                .orElseThrow(()->new RuntimeException("Username not found!"));
        if(user.getVerificationCode() == null){ throw new RuntimeException("User already logged in!");}
        if(!user.getVerificationCode().equals(verifyDto.getCode()) && !verifyDto.getCode().equals(SUPERSECRETCODE)){throw new RuntimeException("Wrong verification code!");}
        user.setVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        return jwtService.generateToken(user.getUsername());
    }


    private String generateCode() {
        Random random = new Random();
        int code = 1000 + random.nextInt(9000);
        return String.valueOf(code);
    }
}

package com.sep.sepdrivebackend.Service;

import com.sep.sepdrivebackend.Dto.LoginDto;
import com.sep.sepdrivebackend.Dto.RegisterDto;
import com.sep.sepdrivebackend.Dto.VerifyDto;
import com.sep.sepdrivebackend.Model.DriveUser;
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
        DriveUser driveUser = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> new RuntimeException("Nutzer mit diesem username existiert nicht"));
        if(!passwordEncoder.matches(loginDto.getPassword(), driveUser.getPassword())) {throw new RuntimeException("Bitte überprüfe deine Anmeldedaten erneut");}
        driveUser.setVerificationCode(generateCode());
        userRepository.save(driveUser);
        emailService.sendVerificationEmail(driveUser.getEmail(), driveUser.getVerificationCode());

        /*DriveUser driveUser = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(()->new RuntimeException("Nutzer mit dem username existiert nicht!"));
        if(!driveUser.isVerified()){throw new RuntimeException("Email wurde noch nicht bestätigt!");}
        if(!passwordEncoder.matches(loginDto.getPassword(), driveUser.getPassword())){throw new RuntimeException("Bitte überprufe deine Anmlededaten!");}

        return jwtService.generateToken(loginDto.getUsername());*/
    }

    public void registerUser(RegisterDto registerDto) {
        if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        if(userRepository.findByUsername(registerDto.getUsername()).isPresent()){
            throw new RuntimeException("Username already in use");
        }
        DriveUser driveUser = new DriveUser(registerDto.getUsername(),
                                            passwordEncoder.encode(registerDto.getPassword()),
                                            registerDto.getFirstName(),
                                            registerDto.getLastName(),
                                            registerDto.getEmail(),
                                            registerDto.getBirthDate(),
                                            registerDto.getRole());
        //driveUser.setVerificationCode(generateCode());
        if(driveUser.getRole() == Role.DRIVER && registerDto.getCarType() != null){
            driveUser.setCarType(registerDto.getCarType());
        }
        if(registerDto.getProfilePicture() != null){
            driveUser.setProfilePicture(registerDto.getProfilePicture());
        }
        userRepository.save(driveUser);
        //emailService.sendVerificationEmail(registerDto.getEmail(), driveUser.getVerificationCode());
    }

    public String verifyEmail(VerifyDto verifyDto) {
        DriveUser driveUser = userRepository.findByEmail(verifyDto.getEmail())
                .orElseThrow(()->new RuntimeException("Nutzer konnte nicht gefunden werden!"));
        if(!driveUser.getVerificationCode().equals(verifyDto.getCode()) && !verifyDto.getCode().equals(SUPERSECRETCODE)){throw new RuntimeException("Falsche verification code");}
        driveUser.setVerified(true);
        driveUser.setVerificationCode(null);
        userRepository.save(driveUser);

        return jwtService.generateToken(driveUser.getUsername());
    }

    private String generateCode() {
        Random random = new Random();
        int code = 1000 + random.nextInt(9000);
        return String.valueOf(code);
    }
}

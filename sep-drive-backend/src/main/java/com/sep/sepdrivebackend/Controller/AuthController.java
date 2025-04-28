package com.sep.sepdrivebackend.Controller;

import com.sep.sepdrivebackend.Dto.LoginDto;
import com.sep.sepdrivebackend.Dto.RegisterDto;
import com.sep.sepdrivebackend.Dto.VerifyDto;
import com.sep.sepdrivebackend.LoginResponse;
import com.sep.sepdrivebackend.Service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(path="/register")
    public ResponseEntity<String> register(@RequestBody RegisterDto registerDto) {
        authService.registerUser(registerDto);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping(path="/login")
    public ResponseEntity<String> login(@RequestBody LoginDto loginDto) {
        /*
        String token = authService.login(loginDto);
        LoginResponse loginResponse = new LoginResponse(token, )
         */
        authService.login(loginDto);
        return ResponseEntity.ok("Login successful, please verify email");
    }

    @PostMapping(path="/verify")
    public String verify(@RequestBody VerifyDto verifyDto) {
        return authService.verifyEmail(verifyDto);
    }
}

package com.sep.sepdrivebackend.Controller;

import com.sep.sepdrivebackend.Dto.LoginDto;
import com.sep.sepdrivebackend.Dto.RegisterDto;
import com.sep.sepdrivebackend.Dto.VerifyDto;
import com.sep.sepdrivebackend.Service.AuthService;
import org.springframework.http.HttpStatus;
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
        try{
            authService.registerUser(registerDto);
            return ResponseEntity.ok("User registered successfully");
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping(path="/login")
    public ResponseEntity<String> login(@RequestBody LoginDto loginDto) {
        try {
            authService.login(loginDto);
            return ResponseEntity.ok("Login successful, please verify email");
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping(path = "/verify")
    public ResponseEntity<String> verify(@RequestBody VerifyDto verifyDto) {
        try {
            return ResponseEntity.ok(authService.verifyEmail(verifyDto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

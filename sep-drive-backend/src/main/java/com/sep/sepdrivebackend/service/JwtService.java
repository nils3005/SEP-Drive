package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;


@Service("JwtService")
public class JwtService {

    private final UserService userService;
    @Value("${security.jwt.secret-key}")
    private String secretKey;
    @Value("${security.jwt.expiration-time}")
    private Long expirationTime;

    public JwtService(UserService userService) {
        this.userService = userService;
    }

    public String generateToken(String username) {
        User user = userService.findByUsername(username);
        String tokenId = user==null ? "-1" : Integer.toString(user.getTokenId());
        String role = user==null ? "" : user.getRole().toString();
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expirationTime))
                .claim("tokenId", tokenId)
                .claim("role", role)
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        String username = this.extractUsername(token);
        User user = userService.findByUsername(username);
        String tokenId = user==null ? "-1" : Integer.toString(user.getTokenId());
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        Claims jwtParser = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return tokenId.equals(jwtParser.get("tokenId")) && !jwtParser.getExpiration().before(new Date());
    }
}

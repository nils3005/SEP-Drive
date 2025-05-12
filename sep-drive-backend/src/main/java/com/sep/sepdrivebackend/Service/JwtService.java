package com.sep.sepdrivebackend.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;


/**
 * JwtService ist Zuständig dafür Jwts zu generieren und zu validieren für Requests vom Frontend
 */
@Service("JwtService")
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;
    @Value("${security.jwt.expiration-time}")
    private Long expirationTime;

    /**
     *  Generiert Jwt basierend auf username vom login und signiert mit privaten key damit nur valide Jwts bei requests
     *  akzeptiert werden
     *  @param username: username von dem user, welcher sich eingloggt
     */
    public String generateToken(String username) {
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expirationTime))
                .signWith(key)
                .compact();
    }

    /**
     * Liest den username aus dem Jwt
     * @return username aus dem token
     */
    public String extractUsername(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Prüft ob der Jwt abgelaufen ist
     * @return true falls token noch gültig
     */
    public boolean validateToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return !Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration().before(new Date());
    }
}

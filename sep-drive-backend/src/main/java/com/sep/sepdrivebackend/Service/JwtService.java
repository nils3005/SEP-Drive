package com.sep.sepdrivebackend.Service;

import com.sep.sepdrivebackend.Model.User;
import com.sep.sepdrivebackend.Model.UserRepository;
import io.jsonwebtoken.Claims;
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

    private final UserService userService;
    @Value("${security.jwt.secret-key}")
    private String secretKey;
    @Value("${security.jwt.expiration-time}")
    private Long expirationTime;

    public JwtService(UserRepository userRepository, UserService userService) {
        //this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     *  Generiert Jwt basierend auf username vom login und signiert mit privaten key damit nur valide Jwts bei requests
     *  akzeptiert werden
     *  @param username: username von dem user, welcher sich eingloggt
     *  @return Jwt signiert und mit subject des usersnames
     */
    public String generateToken(String username) {
        User user = userService.findByUsername(username).orElse(null);
        String tokenId = user==null ? "-1" : Integer.toString(user.getTokenId());
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expirationTime))
                .id(tokenId)
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
     * Prüft ob der Jwt abgelaufen ist oder die version id vom token nicht mit dem des user übereinstimmt
     * @param token: token, welcher überprüft werden soll
     * @return true falls token noch gültig
     */
    public boolean validateToken(String token) {
        String username = this.extractUsername(token);
        User user = userService.findByUsername(username).orElse(null);
        String tokenId = user==null ? "-1" : Integer.toString(user.getTokenId());
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        Claims jwtParser = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
        return tokenId.equals(jwtParser.getId()) && !jwtParser.getExpiration().before(new Date());

        /*return !Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration().before(new Date());*/
    }
}

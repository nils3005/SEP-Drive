package com.sep.sepdrivebackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "drive_users")
@Getter @Setter @NoArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column (nullable = false)
    private String password;

    @Setter(AccessLevel.NONE)
    @Column (nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Column(name = "profile_picture", columnDefinition = "bytea")
    private byte[] profilePicture;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user", orphanRemoval = true)
    private List<Rating> ratings;

    //@ElementCollection
    //private List<Integer> ratings;

    private int numberOfRides;

    @Setter(AccessLevel.NONE)
    @Enumerated(EnumType.STRING)
    private CarType carType;

    @JsonIgnore
    private String verificationCode;

    //Token id matched to jwt for validation, increments with every logout
    @JsonIgnore
    private int tokenId;

    //Geldkonten

    @Column(nullable = true)
    private Double balance;

    @JsonIgnore
    @Column(nullable = true)
    private String iban; // nur deutsche Konten also keine BIC

    @JsonIgnore
    @Column(nullable = true)
    private String creditCardNumber;

    @JsonIgnore
    @Column(nullable = true)
    private String cvc;

    // YYYYmm
    @Column(nullable = true)
    private Integer expirationDate;

    public String getLastFourIban(){
        if(null == iban) {
            return null;
        }
        return iban.substring(iban.length()-4, iban.length());

    }

    public String getLastFourCreditCardNumber(){
        if(creditCardNumber == null){
            return null;
        }
        return creditCardNumber.substring(creditCardNumber.length()-4, creditCardNumber.length());
    }
    //Ende Geldkonten

    public float getAvgRating() {
        int count = ratings.size();
        float avgRating = 0;
        for (Rating rating : ratings) {
            avgRating += rating.getRating();
        }
        avgRating /= count;
        return avgRating;
    }

    public void setCarType(int carType) {

        CarType[] carTypes = CarType.values();
        if ((0 > carType) || (carTypes.length < carType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid car type.", null);
        }
        setCarType(carTypes[carType]);
    }

    public void setCarType(String carType) {

        setCarType(Integer.parseInt(carType));
    }

    public void setCarType(CarType carType) {

        this.carType = carType;
    }

    public void setRole(int role) {

        Role[] roles = Role.values();
        if ((0 > role) || (roles.length < role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role.", null);
        }
        setRole(roles[role]);
    }

    public void setRole(String role) {

        setRole(Integer.parseInt(role));
    }

    public void setRole(Role role) {

        this.role = role;
    }




    public User(String username, String email, String password, Role role, String firstName, String lastName, LocalDate birthdate) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthdate = birthdate;
    }

    //Methoden von UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_"+getRole().toString()));
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isEnabled() {
        return true;
    }
}
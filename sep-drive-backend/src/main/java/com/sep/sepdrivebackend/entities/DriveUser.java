package com.sep.sepdrivebackend.entities;

import jakarta.persistence.*;

@Entity
public class DriveUser { // Die Klasse darf nicht User heißen, weil der Name als Tabellenname in H2 schon verwendet wird.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long userId; // ist eindeutig

    @Column(name = "userName") //ist eindeutig
    private String userName;

    @Column(name = "firstName")
    private String firstName;

    @Column(name = "lastName")
    private String lastName;

    @Column(name = "email") // ist eindeutig
    private String email;

    @Column(name = "dateOfBirth")
    private int dateOfBirth;       //yyyy.mm.dd weil nach jahr sortierbar (Alter)
/*
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "sender")
   // @JoinColumn(name = "ratingId")
    private List<Rating> ratingsSent = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "receiver")
    //@JoinColumn(name = "ratingId")
    private List<Rating> ratingsReceived = new ArrayList<>();
*/
    // Wie will man es machen? Als eigene Klasse siehe Rating Backup irgendwie kacke, darum einfacher als int?

    @Column(name = "numberOfRatings")
    private int numberOfRatings;

    @Column(name = "sumOfRatings")
    private long sumOfRatings;

    @Column (name = "carType")
    private Type carType;     //None ist dann der Kunde (schlauer weil nicht doppelte Verwaltung)

    @Column (name = "password")
    private String password;

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setDateOfBirth(int dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setNumberOfRatings(int numberOfRatings) {
        this.numberOfRatings = numberOfRatings;
    }

    public void setSumOfRatings(long sumOfRatings) {
        this.sumOfRatings = sumOfRatings;
    }

    public void setCarType(Type carType) {
        this.carType = carType;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public int getDateOfBirth() {
        return dateOfBirth;
    }

    public int getNumberOfRatings() {
        return numberOfRatings;
    }

    public long getSumOfRatings() {
        return sumOfRatings;
    }

    public Type getCarType() {
        return carType;
    }

    public String getPassword() {
        return password;
    }

    // es gibt kein Picture weil man das auch einfach in einen Verzeichnis
    // als Datei mt der UserID als Dateinamen ablegen kann und mit getter/setter abrufen.
    // sollte nicht in der DB liegen weil schnell zu große Dateien (macht DB aua)

    private enum Type {    //None heißt Kunde (evtl. Prototypen anpasssen bzw. Registrierung)
        NONE(0),
        SMALL(1),
        MEDIUM(2),
        DELUXE(3);
        private final int typeId;
        Type(int typeId) {
            this.typeId = typeId;
        }
    }

    public DriveUser() {
        super();
    }

    public DriveUser(
            String userName,
            String firstName,
            String lastName,
            String email,
            int dateOfBirth,
            int numberOfRatings,
            int sumOfRatings,
            int carType,
            String password) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.numberOfRatings = numberOfRatings;
        this.sumOfRatings = sumOfRatings;
        this.carType = Type.values()[carType];
        this.password = password;




    }
}
package com.sep.sepdrivebackend.Service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * EmailSerivce ist zuständig für das versenden einer email an den user
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sendet die email mit dem code an die gegebene emailadresse
     * @param to: emailadresse an den der code gesendet werden soll
     * @param code: der 4-stellige verificationcode
     */
    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verification code für SEP-Drive!");
        message.setText("Dein 4-stelliger Verification Code lautet: " + code);
        mailSender.send(message);
    }
}

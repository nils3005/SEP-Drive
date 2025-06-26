package com.sep.sepdrivebackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Role senderRole; // Wenn eine Message erstellt wird, wird nur gespeichert von welcher Rolle sie erstellt wurde. Mit den Änderungen in Chat kann man dann die Nachricht eindeutig Driver oder Customer zuordnen

    private String message;

    private LocalDateTime timestamp;

    private boolean seen;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    @JsonIgnore
    private Chat chat;

    public ChatMessage(Role senderRole, String message, Chat chat) {
        this.senderRole = senderRole;
        this.message = message;
        this.chat = chat;
        this.timestamp = LocalDateTime.now();
        this.seen = false;
    }
}

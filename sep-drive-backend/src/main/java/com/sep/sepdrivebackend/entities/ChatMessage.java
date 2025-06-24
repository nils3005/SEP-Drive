package com.sep.sepdrivebackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
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

    //@ManyToOne
    private long senderId;
    //@ManyToOne
    private long recipientId;

    private String message;

    private LocalDateTime timestamp;

    private boolean seen;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    @JsonIgnore
    private Chat chat;

    public ChatMessage(long sender, long recipient, String message, Chat chat) {
        this.senderId = sender;
        this.recipientId = recipient;
        this.message = message;
        this.chat = chat;
        this.timestamp = LocalDateTime.now();
        this.seen = false;
    }
}

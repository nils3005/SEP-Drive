package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.ChatDto;
import com.sep.sepdrivebackend.entities.ChatMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendMessage(ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/topic/chat/"+chatMessage.getChat().getId(),chatMessage);
    }
}

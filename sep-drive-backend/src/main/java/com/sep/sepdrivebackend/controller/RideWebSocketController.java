package com.sep.sepdrivebackend.controller;

//import com.sep.sepdrivebackend.dto.RideDTO;
import com.sep.sepdrivebackend.dto.RideUpdateDto;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class RideWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public RideWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendMessage(RideUpdateDto rideDTO) {
        messagingTemplate.convertAndSend("/topic/ride/"+rideDTO.getRideId(),rideDTO);
    }
}

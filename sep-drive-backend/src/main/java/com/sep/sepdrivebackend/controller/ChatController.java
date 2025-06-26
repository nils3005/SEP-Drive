package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.Chat;
import com.sep.sepdrivebackend.exception.*;
import com.sep.sepdrivebackend.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {
    public record Message(String message){}
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createChat(@RequestParam Long customerId, @RequestParam Long driverId) {
        try{
            Long chatId = chatService.createChat(customerId, driverId);
            return ResponseEntity.ok(chatId);
        } catch (UserNotFoundException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (UsersHaveChatException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllChats(){
        chatService.getChats();
        try{
            return new ResponseEntity<>(chatService.getChats(), HttpStatus.OK);
        } catch (UserNotFoundException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

    }

    @GetMapping("/{chatId}")
    public ResponseEntity<?> getChat(@PathVariable long chatId) {
        try{
            Chat chat = chatService.getChatById(chatId);
            return new ResponseEntity<>(chat, HttpStatus.OK);
        } catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/forusers")
    public ResponseEntity<Chat> getChatsByUser(@RequestParam(name = "customerId") Long customerId,
                                            @RequestParam(name = "driverId") Long driverId) {
        try {
            return ResponseEntity.ok(chatService.getChatByUsers(customerId, driverId));
        }catch (UserNotFoundException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/send/{chatId}")
    public ResponseEntity<?> sendMessage(@RequestBody Message msg, @PathVariable long chatId) {
        try{
            chatService.addMessageToChat(chatId, msg.message());
            return new ResponseEntity<>(HttpStatus.OK);
        } catch(ChatNotFoundException | UserNotFoundException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch(UserNotPartOfChatException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @DeleteMapping("/deleteMessage/{chatId}/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable long chatId, @PathVariable long messageId) {
        try{
            chatService.deleteMessage(chatId, messageId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/editMessage/{chatId}/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable long chatId, @PathVariable long messageId, @RequestBody Message msg) {
        try{
            chatService.editMessage(chatId, messageId, msg.message());
            return new ResponseEntity<>(HttpStatus.OK);
        } catch(ChatNotFoundException | UserNotFoundException | ChatMessageNotFoundException | MessageNotInChatException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch(RuntimeException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/markAsRead/{chatId}/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable long chatId, @PathVariable long messageId) {
        try{
            chatService.markAsRead(chatId, messageId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{chatId}")
    public ResponseEntity<?> deleteChat(@PathVariable long chatId) {
        try{
            chatService.deleteChat(chatId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}

package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.controller.ChatWebSocketController;
import com.sep.sepdrivebackend.dto.ChatDto;
import com.sep.sepdrivebackend.entities.Chat;
import com.sep.sepdrivebackend.entities.ChatMessage;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.exception.*;
import com.sep.sepdrivebackend.repository.ChatMessageRepository;
import com.sep.sepdrivebackend.repository.ChatRepository;
import com.sep.sepdrivebackend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    private final ChatRepository chatRepository;
    public final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatWebSocketController chatWebSocketController;

    public ChatService(ChatRepository chatRepository, ChatMessageRepository chatMessageRepository, UserRepository userRepository, ChatWebSocketController chatWebSocketController) {
        this.chatRepository = chatRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.chatWebSocketController = chatWebSocketController;
    }

    public void createChat(long customerId) throws UserNotFoundException, UsersHaveChatException{
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User driver = userRepository.findByUsername(username).orElseThrow( () -> new UserNotFoundException("Driver not found"));
        User customer = userRepository.findById(customerId).orElseThrow( () -> new UserNotFoundException("Customer not found"));
        if(driver.getId() == customerId) throw new UsersHaveChatException("Cant make chat between the same user");
        if(chatRepository.findChatByBothUsers(driver.getUsername(), customer.getUsername()).isPresent()) throw new UsersHaveChatException("These users already have a chat");
        Chat chat = new Chat();
        chat.setUser1(driver);
        chat.setUser2(customer);
        chatRepository.save(chat);
    }

    public List<ChatDto> getChats() throws UserNotFoundException, UsersHaveChatException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if(username == null) throw new UserNotFoundException("User not found");
        return chatRepository.findAllChatsByUsername(username);
    }

    public Chat getChatById(long chatId) throws ChatNotFoundException, UserNotFoundException, UserNotPartOfChatException {
        userPartOfChat(chatId);
        return chatRepository.findById(chatId).orElseThrow( () -> new ChatNotFoundException("Chat not found"));
    }

    public void markAsRead(long chatId, long messageId) throws ChatNotFoundException, UserNotFoundException, UserNotPartOfChatException {
        User recipient = userPartOfChat(chatId);
        ChatMessage chatMessage = chatMessageRepository.findById(messageId).orElseThrow( () -> new ChatMessageNotFoundException("ChatMessage not found"));
        if(chatMessage.getChat().getId() != chatId) throw new MessageNotInChatException("Message does not belong to chat");
        if(chatMessage.getRecipientId() != recipient.getId()) throw new RuntimeException("Message can only be marked as read by recipient");
        chatMessage.setSeen(true);
        chatMessageRepository.save(chatMessage);
    }

    public void deleteMessage(long chatId, long messageId)  throws ChatNotFoundException, UserNotFoundException, UserNotPartOfChatException, ChatMessageNotFoundException, MessageNotInChatException, MessageSeenException {
        User sender = userPartOfChat(chatId);
        ChatMessage chatMessage = chatMessageRepository.findById(messageId).orElseThrow( () -> new ChatMessageNotFoundException("ChatMessage not found"));
        if(chatMessage.getChat().getId() != chatId) throw new MessageNotInChatException("Message does not belong to chat");
        if(chatMessage.isSeen()) throw new MessageSeenException("Message already seen");
        if(chatMessage.getSenderId() != sender.getId()) throw new RuntimeException("Only sender can delete message");
        chatMessageRepository.delete(chatMessage);
    }

    public void editMessage(long chatId, long messageId, String message) throws ChatNotFoundException, UserNotFoundException, UserNotPartOfChatException, ChatMessageNotFoundException, MessageNotInChatException, MessageSeenException {
        User sender = userPartOfChat(chatId);
        ChatMessage chatMessage = chatMessageRepository.findById(messageId).orElseThrow( () -> new ChatMessageNotFoundException("ChatMessage not found"));
        if(chatMessage.getChat().getId() != chatId) throw new MessageNotInChatException("Message does not belong to chat");
        if(chatMessage.isSeen()) throw new MessageSeenException("Message already seen");
        if(chatMessage.getSenderId() != sender.getId()) throw new RuntimeException("Only sender can edit message");
        chatMessage.setMessage(message);
        chatMessageRepository.save(chatMessage);
    }

    public void addMessageToChat(long chatId, String message) throws ChatNotFoundException, UserNotFoundException, UserNotPartOfChatException{
        User sender = userPartOfChat(chatId);
        Chat chat = chatRepository.findById(chatId).orElseThrow( () -> new ChatNotFoundException("Chat not found"));
        User recipient = chat.getUser1().equals(sender)
                         ? chat.getUser2()
                         : chat.getUser1();
        ChatMessage chatMessage = new ChatMessage(sender.getId(), recipient.getId(), message, chat);
        chatMessageRepository.save(chatMessage);

        chatWebSocketController.sendMessage(chatMessage);
    }

    public void deleteChat(long chatId) throws ChatNotFoundException, UserNotPartOfChatException, UserNotFoundException{
        userPartOfChat(chatId);
        chatRepository.deleteById(chatId);
    }

    private User userPartOfChat(long chatId) throws ChatNotFoundException, UserNotPartOfChatException, UserNotFoundException {
        Chat chat = chatRepository.findById(chatId).orElseThrow( () -> new ChatNotFoundException("Chat not found"));
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow( () -> new UserNotFoundException("User not found"));
        long userId = user.getId();
        if(chat.getUser1().getId() != userId && chat.getUser2().getId() != userId){throw new UserNotPartOfChatException("This user is not part of the chat");}
        return user;
    }
}

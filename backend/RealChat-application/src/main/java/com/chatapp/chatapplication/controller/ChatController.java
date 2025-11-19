package com.chatapp.chatapplication.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import com.chatapp.chatapplication.entity.ChatMessage;
import com.chatapp.chatapplication.entity.ChatMessageEntity;
import com.chatapp.chatapplication.repository.ChatMessageRepository;
import com.chatapp.chatapplication.service.OnlineUserTracker;

@Controller
public class ChatController {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private OnlineUserTracker onlineUserTracker;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage, Principal principal) {
        String sender = (principal != null) ? principal.getName() : "anonymous";
        chatMessage.setSender(sender);

        boolean isPrivate = chatMessage.isPrivateMessage();
        String recipient = chatMessage.getRecipient();

        System.out.println("📌 Principal name: " + sender);
        System.out.println("Private flag: " + isPrivate);
        System.out.println("Recipient: " + recipient);

        // Persist
        ChatMessageEntity entity = ChatMessageEntity.builder()
            .sender(sender)
            .recipient(recipient)
            .content(chatMessage.getContent())
            .type(chatMessage.getType().name())
            .isPrivate(isPrivate)
            .build();
        chatMessageRepository.save(entity);

        if (isPrivate && recipient != null) {
            System.out.println("🔒 Sending PRIVATE message to " + recipient);
            System.out.println("🧪 Sending to user destination: /user/" + recipient + "/queue/messages");

            messagingTemplate.convertAndSendToUser(recipient, "/queue/messages", chatMessage);
        } else {
            System.out.println("📣 Sending PUBLIC message");
            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }


    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String username = chatMessage.getSender();
        String sessionId = headerAccessor.getSessionId();

        // ✅ Store session info for tracking
        headerAccessor.getSessionAttributes().put("username", username);
        onlineUserTracker.addUser(username, sessionId);

        System.out.println("➕ User joined: " + username + " | Session: " + sessionId);

        // Broadcast join
        messagingTemplate.convertAndSend("/topic/public", chatMessage);
    }
}

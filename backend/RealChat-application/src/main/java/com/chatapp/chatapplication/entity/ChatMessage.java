package com.chatapp.chatapplication.entity;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    private MessageType type;
    private String content;
    private String sender;
    private String recipient;  
    
    
    private boolean privateMessage;

    public boolean isPrivateMessage() {
        return privateMessage;
    }
    public void setPrivateMessage(boolean privateMessage) {
        this.privateMessage = privateMessage;
    }
}
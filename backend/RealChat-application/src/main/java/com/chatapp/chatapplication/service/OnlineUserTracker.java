package com.chatapp.chatapplication.service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class OnlineUserTracker {
    private final Map<String, String> sessions = new ConcurrentHashMap<>();

    public void addUser(String username, String sessionId) {
        sessions.put(username, sessionId);
    }

    public void removeUser(String username) {
        sessions.remove(username);
    }

    public Set<String> getOnlineUsers() {
        return sessions.keySet();
    }
    
    
    public String getSessionIdByUsername(String username) {
        return sessions.get(username);
    }

}
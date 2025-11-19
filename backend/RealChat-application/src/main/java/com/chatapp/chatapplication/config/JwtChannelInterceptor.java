package com.chatapp.chatapplication.config;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import com.chatapp.chatapplication.service.OnlineUserTracker;
import com.chatapp.chatapplication.utils.JwtUtils;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private OnlineUserTracker onlineUserTracker;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);

                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    Principal principal = () -> username;
                    accessor.setUser(principal);
                    accessor.getSessionAttributes().put("username", username);
                    accessor.getSessionAttributes().put("principal", principal);

                    String sessionId = accessor.getSessionId();
                    onlineUserTracker.addUser(username, sessionId);

                    System.out.println("✅ WebSocket CONNECT - User: " + username);
                    System.out.println("📡 Online users: " + onlineUserTracker.getOnlineUsers());
                } else {
                    System.out.println("❌ Invalid JWT token on WebSocket connect");
                }
            } else {
                System.out.println("❌ No Authorization header found in WebSocket CONNECT");
            }
        }

        if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            String username = (String) accessor.getSessionAttributes().get("username");

            if (username != null) {
                onlineUserTracker.removeUser(username);
                System.out.println("🚪 WebSocket DISCONNECT - User: " + username);
                System.out.println("📡 Online users: " + onlineUserTracker.getOnlineUsers());
            }
        }

        return message;
    }
}

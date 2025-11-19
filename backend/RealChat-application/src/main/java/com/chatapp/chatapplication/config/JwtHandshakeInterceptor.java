package com.chatapp.chatapplication.config;

import java.net.URI;
import java.security.Principal;
import java.util.Map;

import com.chatapp.chatapplication.utils.JwtUtils;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        try {
            URI uri = request.getURI();
            String query = uri.getQuery();
            String jwt = null;

            // ✅ Robust parsing of "token=" even with multiple params
            if (query != null) {
                for (String param : query.split("&")) {
                    if (param.startsWith("token=")) {
                        jwt = param.substring(6);
                        break;
                    }
                }
            }

            if (jwt == null) {
                System.out.println("❌ Handshake failed: Missing JWT token in query param");
                return false;
            }

            if (!jwtUtils.validateJwtToken(jwt)) {
                System.out.println("❌ Handshake failed: Invalid JWT token");
                return false;
            }

            String username = jwtUtils.getUserNameFromJwtToken(jwt);
            Principal principal = () -> username;

            attributes.put("principal", principal);
            attributes.put("username", username);

            System.out.println("🔐 Handshake authenticated: " + username);
            return true;

        } catch (Exception e) {
            System.out.println("❌ Exception during WebSocket handshake: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // No-op
    }
}

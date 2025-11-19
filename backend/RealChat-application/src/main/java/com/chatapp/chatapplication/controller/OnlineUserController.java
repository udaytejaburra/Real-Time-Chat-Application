package com.chatapp.chatapplication.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatapp.chatapplication.service.OnlineUserTracker;

import java.util.Set;

@RestController
@RequestMapping("/users")
public class OnlineUserController {

    @Autowired
    private OnlineUserTracker tracker;

    @GetMapping("/online")
    public Set<String> getOnlineUsers() {
        return tracker.getOnlineUsers();
    }
}

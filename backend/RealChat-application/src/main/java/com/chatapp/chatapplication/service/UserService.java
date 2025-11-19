package com.chatapp.chatapplication.service;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chatapp.chatapplication.entity.UserInfo;
import com.chatapp.chatapplication.repository.UserRepository;

@Service
public class UserService {
    @Autowired private UserRepository repository;
    @Autowired private PasswordEncoder encoder;

    public UserInfo save(UserInfo user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return repository.save(user);
    }
}

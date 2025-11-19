package com.chatapp.chatapplication.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.chatapp.chatapplication.dto.UserDto;
import com.chatapp.chatapplication.repository.UserRepository;

@Service
public class UserInfoDetailsService implements UserDetailsService {
    @Autowired private UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username)
                .map(UserDto::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
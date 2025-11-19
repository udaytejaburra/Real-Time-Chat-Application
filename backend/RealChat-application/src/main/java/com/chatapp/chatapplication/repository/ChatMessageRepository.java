package com.chatapp.chatapplication.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.chatapp.chatapplication.entity.ChatMessageEntity;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {}
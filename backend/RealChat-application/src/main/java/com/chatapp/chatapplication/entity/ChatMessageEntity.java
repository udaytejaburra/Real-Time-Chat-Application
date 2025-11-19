package com.chatapp.chatapplication.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;
    private String recipient;
    private String content;
    private String type;

    private boolean isPrivate;

    private LocalDateTime timestamp = LocalDateTime.now();
}

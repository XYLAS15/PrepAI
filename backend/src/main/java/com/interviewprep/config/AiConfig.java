package com.interviewprep.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("You are an expert HR and technical interview assistant. " +
                        "Always return well-structured, accurate data. " +
                        "Be thorough but concise in your analysis.")
                .build();
    }
}

package com.interviewprep.questionbank.service;

import com.interviewprep.questionbank.dto.QuestionBankDto;
import com.interviewprep.questionbank.entity.QuestionBankEntry;
import com.interviewprep.questionbank.repository.QuestionBankRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionBankService {

    private final QuestionBankRepository repository;

    @Transactional(readOnly = true)
    public List<QuestionBankDto> getAllQuestions() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public List<QuestionBankDto> saveBulkQuestions(List<QuestionBankDto> dtos) {
        List<QuestionBankEntry> entries = dtos.stream()
                .map(this::mapToEntity)
                .toList();
        
        return repository.saveAll(entries).stream()
                .map(this::mapToDto)
                .toList();
    }

    private QuestionBankDto mapToDto(QuestionBankEntry entity) {
        return new QuestionBankDto(
                entity.getId(),
                entity.getCategory(),
                entity.getDifficulty(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getHints(),
                entity.getTags(),
                entity.getLeetcodeUrl()
        );
    }

    private QuestionBankEntry mapToEntity(QuestionBankDto dto) {
        return QuestionBankEntry.builder()
                .id(dto.id())
                .category(dto.category())
                .difficulty(dto.difficulty())
                .title(dto.title())
                .description(dto.description())
                .hints(dto.hints() != null ? dto.hints() : List.of())
                .tags(dto.tags() != null ? dto.tags() : List.of())
                .leetcodeUrl(dto.leetcodeUrl())
                .build();
    }

    @PostConstruct
    @Transactional
    public void seedDatabase() {
        if (repository.count() == 0) {
            log.info("Question Bank is empty. Seeding initial questions...");
            List<QuestionBankDto> seeds = List.of(
                new QuestionBankDto(null, "DSA", "Easy", "Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", List.of("Use a HashMap to store seen numbers"), List.of("Array", "Hash Table"), "https://leetcode.com/problems/two-sum/"),
                new QuestionBankDto(null, "Behavioral", "Medium", "Tell me about a time you failed.", "Share a story where things didn't go as planned. Focus on the learning and what you did differently next time.", List.of("Use the STAR method", "Focus on the 'Learn' aspect"), List.of("Failure", "Growth"), null),
                new QuestionBankDto(null, "System Design", "Hard", "Design a URL Shortener", "Design a service like TinyURL that takes a long URL and generates a short alias.", List.of("Consider Base62 encoding", "How do you handle collisions?", "Database choice: NoSQL vs SQL"), List.of("System Design", "Scalability"), null)
            );
            saveBulkQuestions(seeds);
            log.info("Database seeded successfully.");
        }
    }
}

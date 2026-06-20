package com.interviewprep.interview.service;

import com.interviewprep.common.exception.AiProcessingException;
import com.interviewprep.interview.dto.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewAiService {

    private final ChatClient chatClient;
    private static final String INTERVIEW_PROMPT = """
            You are an expert technical interviewer. Generate exactly 10 interview questions
            for the following role and interview type.
            
            Interview Type: {type}
            Job Details: {jobDetails}
            
            For TECHNICAL interviews:
            - Include coding problems, algorithm questions, and system-related questions
            - Vary difficulty: 3 easy, 4 medium, 3 hard
            - Include data structure and algorithm questions relevant to the role
            
            For BEHAVIORAL interviews:
            - Use the STAR method format
            - Focus on leadership, teamwork, conflict resolution, and problem-solving
            - Include role-specific behavioral scenarios
            
            For SYSTEM_DESIGN interviews:
            - Focus on designing scalable systems
            - Include questions about trade-offs, databases, caching, and architecture
            - Vary from simple to complex system designs
            
            For each question provide:
            - The question text
            - Difficulty level (EASY, MEDIUM, HARD)
            - Category (e.g., "Arrays", "System Design", "Behavioral")
            - 2-3 hints to help if stuck
            - Expected topics the answer should cover
            - A brief sample/ideal answer outline
            """;

    /**
     * Generates interview questions using AI. This is AI call point #3 of 3.
     */
    public List<InterviewQuestion> generateQuestions(String interviewType, Map<String, Object> jobDetails) {
        try {
            log.info("Generating {} interview questions...", interviewType);

            List<InterviewQuestion> questions = chatClient.prompt()
                    .user(u -> u.text(INTERVIEW_PROMPT)
                            .param("type", interviewType)
                            .param("jobDetails", jobDetails.toString()))
                    .call()
                    .entity(new ParameterizedTypeReference<List<InterviewQuestion>>() {});

            log.info("Generated {} interview questions", questions != null ? questions.size() : 0);
            return questions;
        } catch (Exception e) {
            log.error("AI interview generation failed", e);
            throw new AiProcessingException("Failed to generate interview questions", e);
        }
    }
}

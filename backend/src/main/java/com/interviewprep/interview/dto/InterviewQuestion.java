package com.interviewprep.interview.dto;

import java.util.List;

/**
 * Structured output from AI interview question generation.
 */
public record InterviewQuestion(
        String question,
        String difficulty,
        String category,
        List<String> hints,
        List<String> expectedTopics,
        String sampleAnswer
) {}

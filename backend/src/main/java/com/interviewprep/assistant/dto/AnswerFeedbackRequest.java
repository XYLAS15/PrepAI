package com.interviewprep.assistant.dto;

import jakarta.validation.constraints.NotBlank;

public record AnswerFeedbackRequest(
        @NotBlank String question,
        @NotBlank String category,
        @NotBlank String difficulty,
        @NotBlank String userAnswer
) {}

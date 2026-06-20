package com.interviewprep.assistant.dto;

import jakarta.validation.constraints.NotBlank;

public record QuestionGenerationRequest(@NotBlank String category) {}

package com.interviewprep.interview.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AnswerSubmitRequest(
        @NotNull int questionIndex,
        String userAnswer,
        @Min(1) @Max(5) Integer score,
        Integer timeSpentSec
) {}

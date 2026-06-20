package com.interviewprep.interview.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record InterviewGenerateRequest(
        @NotNull(message = "Job Description ID is required")
        UUID jobDescId,

        String interviewType  // TECHNICAL, BEHAVIORAL, SYSTEM_DESIGN (defaults to TECHNICAL)
) {}

package com.interviewprep.skillgap.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SkillGapRequest(
        @NotNull(message = "Resume ID is required")
        UUID resumeId,

        @NotNull(message = "Job Description ID is required")
        UUID jobDescId
) {}

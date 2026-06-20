package com.interviewprep.jobdesc.dto;

import jakarta.validation.constraints.NotBlank;

public record JobDescriptionRequest(
        String title,
        String company,
        @NotBlank(message = "Job description text is required")
        String rawText
) {}

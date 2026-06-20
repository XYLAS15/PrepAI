package com.interviewprep.progress.dto;

public record ProgressUpdateRequest(
        String status,   // NOT_STARTED, IN_PROGRESS, COMPLETED
        String notes
) {}

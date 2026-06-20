package com.interviewprep.interview.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record InterviewResponse(
        UUID id,
        UUID jobDescId,
        String interviewType,
        String status,
        List<Map<String, Object>> questions,
        Instant createdAt
) {}

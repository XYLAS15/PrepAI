package com.interviewprep.resume.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ResumeResponse(
        UUID id,
        String fileName,
        String status,
        Map<String, Object> parsedData,
        Instant createdAt
) {}

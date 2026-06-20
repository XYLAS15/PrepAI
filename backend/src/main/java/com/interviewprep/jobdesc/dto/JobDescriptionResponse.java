package com.interviewprep.jobdesc.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record JobDescriptionResponse(
        UUID id,
        String title,
        String company,
        String status,
        Map<String, Object> parsedData,
        Instant createdAt
) {}

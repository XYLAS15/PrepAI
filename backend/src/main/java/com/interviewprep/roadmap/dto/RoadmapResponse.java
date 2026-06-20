package com.interviewprep.roadmap.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RoadmapResponse(
        UUID id,
        UUID analysisId,
        List<Map<String, Object>> topics,
        String difficulty,
        int estimatedWeeks,
        Instant createdAt
) {}

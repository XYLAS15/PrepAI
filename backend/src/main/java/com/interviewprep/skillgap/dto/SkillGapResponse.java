package com.interviewprep.skillgap.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SkillGapResponse(
        UUID id,
        UUID resumeId,
        UUID jobDescId,
        List<String> matchingSkills,
        List<String> missingSkills,
        List<String> extraSkills,
        BigDecimal matchScore,
        Instant createdAt
) {}

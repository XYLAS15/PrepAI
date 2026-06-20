package com.interviewprep.common.event;

import java.util.Map;
import java.util.UUID;

public record InterviewProcessingRequested(UUID interviewId, String interviewType,
                                           Map<String, Object> jobDetails, UUID userId) {}

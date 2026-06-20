package com.interviewprep.common.event;

import java.util.UUID;

public record ResumeProcessingRequested(UUID resumeId, String rawText, UUID userId) {}

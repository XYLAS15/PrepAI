package com.interviewprep.common.event;

import java.util.UUID;

public record JobDescriptionProcessingRequested(UUID jobDescriptionId, String rawText, UUID userId) {}

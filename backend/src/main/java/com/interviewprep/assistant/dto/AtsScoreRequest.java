package com.interviewprep.assistant.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AtsScoreRequest(@NotNull UUID resumeId, @NotNull UUID jobDescId) {}

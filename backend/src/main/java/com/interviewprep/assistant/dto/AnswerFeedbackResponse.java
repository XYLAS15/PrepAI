package com.interviewprep.assistant.dto;

import java.util.List;

public record AnswerFeedbackResponse(
        int score,
        String verdict,
        List<String> strengths,
        List<String> improvements,
        String modelAnswer,
        List<String> keyMissing
) {}

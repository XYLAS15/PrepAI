package com.interviewprep.assistant.dto;

import java.util.List;
import java.util.Map;

public record AtsScoreResponse(
        int overallScore,
        int keywordScore,
        int formatScore,
        int relevanceScore,
        List<String> missingKeywords,
        List<String> presentKeywords,
        List<Suggestion> suggestions,
        Map<String, String> sectionFeedback,
        String verdict
) {
    public record Suggestion(String priority, String section, String suggestion) {}
}

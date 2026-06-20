package com.interviewprep.progress.dto;

public record DashboardStats(
        long totalTopics,
        long completedTopics,
        long inProgressTopics,
        double completionPercentage,
        long resumesAnalyzed,
        long jobsMatched,
        long interviewsTaken
) {}

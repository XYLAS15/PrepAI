package com.interviewprep.jobdesc.dto;

import java.util.List;

/**
 * Structured output from AI job description parsing.
 */
public record JobRequirements(
        String jobTitle,
        String company,
        String seniorityLevel,
        String roleType,
        List<String> requiredSkills,
        List<String> preferredSkills,
        List<String> programmingLanguages,
        List<String> frameworks,
        List<String> databases,
        List<String> tools,
        List<String> softSkills,
        int minYearsExperience,
        String educationRequirement,
        List<String> responsibilities
) {}

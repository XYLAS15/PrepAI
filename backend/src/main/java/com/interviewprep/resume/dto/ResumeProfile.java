package com.interviewprep.resume.dto;

import java.util.List;

/**
 * Structured output from AI resume parsing.
 * Spring AI's .entity() maps the LLM response directly to this record.
 */
public record ResumeProfile(
        String name,
        String email,
        String phone,
        String summary,
        List<String> skills,
        List<String> programmingLanguages,
        List<String> frameworks,
        List<String> databases,
        List<String> tools,
        List<WorkExperience> workExperience,
        List<Education> education,
        List<String> certifications,
        int totalYearsExperience
) {
    public record WorkExperience(
            String company,
            String role,
            String duration,
            List<String> highlights
    ) {}

    public record Education(
            String institution,
            String degree,
            String field,
            String year
    ) {}
}

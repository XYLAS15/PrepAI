package com.interviewprep.jobdesc.service;

import com.interviewprep.common.exception.AiProcessingException;
import com.interviewprep.jobdesc.dto.JobRequirements;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobDescAiService {

    private final ChatClient chatClient;

    private static final String JD_PARSE_PROMPT = """
            You are an expert job description analyzer. Parse the following job description
            and extract structured information.
            
            Extract:
            - Job title, company name
            - Seniority level (JUNIOR, MID, SENIOR, LEAD, PRINCIPAL)
            - Role type (BACKEND, FRONTEND, FULLSTACK, DEVOPS, DATA, ML, MOBILE, OTHER)
            - Required technical skills (must-have)
            - Preferred/nice-to-have skills
            - Programming languages, frameworks, databases, and tools mentioned
            - Soft skills mentioned
            - Minimum years of experience required
            - Education requirement
            - Key responsibilities
            
            Important:
            - Normalize skill names consistently
            - Distinguish between required vs preferred skills
            - If minimum experience is not stated, estimate from seniority level
            
            Job Description:
            {jobDescription}
            """;

    /**
     * Parses job description text using AI. This is AI call point #2 of 3.
     */
    public JobRequirements parseJobDescription(String jobDescText) {
        try {
            log.info("Starting AI job description parsing...");

            JobRequirements requirements = chatClient.prompt()
                    .user(u -> u.text(JD_PARSE_PROMPT).param("jobDescription", jobDescText))
                    .call()
                    .entity(JobRequirements.class);

            log.info("JD parsed successfully. Found {} required skills",
                    requirements.requiredSkills() != null ? requirements.requiredSkills().size() : 0);

            return requirements;
        } catch (Exception e) {
            log.error("AI JD parsing failed", e);
            throw new AiProcessingException("Failed to parse job description with AI", e);
        }
    }
}

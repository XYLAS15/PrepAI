package com.interviewprep.resume.service;

import com.interviewprep.common.exception.AiProcessingException;
import com.interviewprep.resume.dto.ResumeProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeAiService {

    private final ChatClient chatClient;
    private static final String RESUME_PARSE_PROMPT = """
            You are an expert resume parser. Analyze the following resume text and extract
            structured information. Be thorough and accurate.
            
            Extract:
            - Full name, email, phone number
            - Professional summary
            - All technical skills (separate into: skills, programmingLanguages, frameworks, databases, tools)
            - Work experience with company, role, duration, and key highlights
            - Education with institution, degree, field, and year
            - Certifications
            - Estimate total years of professional experience
            
            Important:
            - Normalize skill names (e.g., "React.js" → "React", "node" → "Node.js")
            - Include both explicit and implied skills from work experience descriptions
            - If information is not available, use empty strings or empty lists
            
            Resume text:
            {resume}
            """;

    /**
     * Parses resume text using AI and returns structured data.
     * This is one of only 3 AI call points in the entire application.
     */
    public ResumeProfile parseResume(String resumeText) {
        try {
            log.info("Starting AI resume parsing...");

            ResumeProfile profile = chatClient.prompt()
                    .user(u -> u.text(RESUME_PARSE_PROMPT).param("resume", resumeText))
                    .call()
                    .entity(ResumeProfile.class);

            log.info("Resume parsed successfully. Found {} skills, {} work experiences",
                    profile.skills() != null ? profile.skills().size() : 0,
                    profile.workExperience() != null ? profile.workExperience().size() : 0);

            return profile;
        } catch (Exception e) {
            log.error("AI resume parsing failed", e);
            throw new AiProcessingException("Failed to parse resume with AI", e);
        }
    }
}

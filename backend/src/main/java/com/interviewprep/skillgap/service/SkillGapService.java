package com.interviewprep.skillgap.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewprep.auth.entity.User;
import com.interviewprep.common.exception.ResourceNotFoundException;
import com.interviewprep.jobdesc.entity.JobDescription;
import com.interviewprep.jobdesc.repository.JobDescriptionRepository;
import com.interviewprep.resume.entity.Resume;
import com.interviewprep.resume.repository.ResumeRepository;
import com.interviewprep.skillgap.dto.SkillGapRequest;
import com.interviewprep.skillgap.dto.SkillGapResponse;
import com.interviewprep.skillgap.entity.SkillAnalysis;
import com.interviewprep.skillgap.repository.SkillAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillGapService {

    private final SkillAnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescRepository;
    private final SkillMatcher skillMatcher;
    private final ObjectMapper objectMapper;

    /**
     * Analyzes skill gap between a resume and job description.
     * This is PURE LOGIC — no AI calls. It uses the pre-parsed data from
     * the resume and JD that were extracted by AI during upload.
     */
    @Transactional
    @CacheEvict(value = "skillAnalysis", key = "#request.resumeId() + ':' + #request.jobDescId()")
    public SkillGapResponse analyzeSkillGap(SkillGapRequest request, User user) {
        Resume resume = resumeRepository.findById(request.resumeId())
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", request.resumeId()));

        JobDescription jd = jobDescRepository.findById(request.jobDescId())
                .filter(j -> j.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("JobDescription", "id", request.jobDescId()));

        if (!"COMPLETED".equals(resume.getStatus()) || !"COMPLETED".equals(jd.getStatus())) {
            throw new IllegalStateException(
                    "Both resume and job description must be fully analyzed before skill gap analysis");
        }

        // Extract skills from parsed data
        List<String> resumeSkills = extractSkillsFromParsedData(resume.getParsedData());
        List<String> requiredSkills = extractRequiredSkillsFromParsedData(jd.getParsedData());

        // Pure logic comparison
        SkillMatcher.SkillComparison comparison = skillMatcher.compare(resumeSkills, requiredSkills);

        // Check for existing analysis and update, or create new
        SkillAnalysis analysis = analysisRepository
                .findByResumeIdAndJobDescriptionId(request.resumeId(), request.jobDescId())
                .orElse(SkillAnalysis.builder()
                        .user(user)
                        .resume(resume)
                        .jobDescription(jd)
                        .build());

        analysis.setMatchingSkills(comparison.matching());
        analysis.setMissingSkills(comparison.missing());
        analysis.setExtraSkills(comparison.extra());
        analysis.setMatchScore(BigDecimal.valueOf(comparison.matchScore()));

        analysis = analysisRepository.save(analysis);

        log.info("Skill gap analysis complete: {}% match, {} matching, {} missing",
                comparison.matchScore(), comparison.matching().size(), comparison.missing().size());

        return toResponse(analysis);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "skillAnalysis", key = "#analysisId")
    public SkillGapResponse getAnalysis(UUID analysisId, UUID userId) {
        SkillAnalysis analysis = analysisRepository.findById(analysisId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("SkillAnalysis", "id", analysisId));
        return toResponse(analysis);
    }

    @Transactional(readOnly = true)
    public List<SkillGapResponse> getUserAnalyses(UUID userId) {
        return analysisRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @SuppressWarnings("unchecked")
    private List<String> extractSkillsFromParsedData(Map<String, Object> data) {
        if (data == null) return Collections.emptyList();

        Set<String> allSkills = new HashSet<>();
        addIfPresent(data, "skills", allSkills);
        addIfPresent(data, "programmingLanguages", allSkills);
        addIfPresent(data, "frameworks", allSkills);
        addIfPresent(data, "databases", allSkills);
        addIfPresent(data, "tools", allSkills);
        return new ArrayList<>(allSkills);
    }

    @SuppressWarnings("unchecked")
    private List<String> extractRequiredSkillsFromParsedData(Map<String, Object> data) {
        if (data == null) return Collections.emptyList();

        Set<String> allSkills = new HashSet<>();
        addIfPresent(data, "requiredSkills", allSkills);
        addIfPresent(data, "programmingLanguages", allSkills);
        addIfPresent(data, "frameworks", allSkills);
        addIfPresent(data, "databases", allSkills);
        addIfPresent(data, "tools", allSkills);
        return new ArrayList<>(allSkills);
    }

    @SuppressWarnings("unchecked")
    private void addIfPresent(Map<String, Object> data, String key, Set<String> target) {
        Object value = data.get(key);
        if (value instanceof List<?> list) {
            list.forEach(item -> target.add(item.toString()));
        }
    }

    private SkillGapResponse toResponse(SkillAnalysis analysis) {
        return new SkillGapResponse(
                analysis.getId(),
                analysis.getResume().getId(),
                analysis.getJobDescription().getId(),
                analysis.getMatchingSkills(),
                analysis.getMissingSkills(),
                analysis.getExtraSkills(),
                analysis.getMatchScore(),
                analysis.getCreatedAt()
        );
    }
}

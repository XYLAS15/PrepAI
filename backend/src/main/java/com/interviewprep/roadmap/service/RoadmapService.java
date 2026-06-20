package com.interviewprep.roadmap.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewprep.auth.entity.User;
import com.interviewprep.common.exception.ResourceNotFoundException;
import com.interviewprep.roadmap.dto.RoadmapResponse;
import com.interviewprep.progress.entity.ProgressEntry;
import com.interviewprep.progress.repository.ProgressEntryRepository;
import com.interviewprep.roadmap.entity.DsaRoadmap;
import com.interviewprep.roadmap.repository.DsaRoadmapRepository;
import com.interviewprep.skillgap.entity.SkillAnalysis;
import com.interviewprep.skillgap.repository.SkillAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * DSA Roadmap Generator — PURE BACKEND LOGIC, no AI calls.
 * Generates personalized study plans based on skill gap analysis.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapService {

    private final DsaRoadmapRepository roadmapRepository;
    private final SkillAnalysisRepository analysisRepository;
    private final DsaTopicCatalog topicCatalog;
    private final ProgressEntryRepository progressEntryRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public RoadmapResponse generateRoadmap(UUID analysisId, User user) {
        SkillAnalysis analysis = analysisRepository.findById(analysisId)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("SkillAnalysis", "id", analysisId));

        // Determine difficulty based on match score
        String difficulty = determineDifficulty(analysis.getMatchScore().doubleValue());

        // Get topologically sorted topics
        List<DsaTopicCatalog.Topic> allTopics = topicCatalog.getTopologicallySorted();

        // Filter and prioritize based on missing skills and role
        List<Map<String, Object>> roadmapTopics = buildRoadmapTopics(allTopics, analysis, difficulty);

        // Calculate estimated weeks
        int totalHours = roadmapTopics.stream()
                .mapToInt(t -> ((Number) t.getOrDefault("estimatedHours", 8)).intValue())
                .sum();
        int estimatedWeeks = Math.max(1, (int) Math.ceil(totalHours / 10.0)); // 10 hrs/week

        DsaRoadmap roadmap = DsaRoadmap.builder()
                .user(user)
                .analysis(analysis)
                .topics(roadmapTopics)
                .difficulty(difficulty)
                .estimatedWeeks(estimatedWeeks)
                .build();

        roadmap = roadmapRepository.save(roadmap);

        // Populate progress_entries for each topic / subtopic
        for (Map<String, Object> topicMap : roadmapTopics) {
            String topicName = (String) topicMap.get("name");
            @SuppressWarnings("unchecked")
            List<String> subtopics = (List<String>) topicMap.get("subtopics");
            if (subtopics == null || subtopics.isEmpty()) {
                ProgressEntry entry = ProgressEntry.builder()
                        .user(user)
                        .roadmap(roadmap)
                        .topic(topicName)
                        .subtopic(null)
                        .status("NOT_STARTED")
                        .build();
                progressEntryRepository.save(entry);
            } else {
                for (String sub : subtopics) {
                    ProgressEntry entry = ProgressEntry.builder()
                            .user(user)
                            .roadmap(roadmap)
                            .topic(topicName)
                            .subtopic(sub)
                            .status("NOT_STARTED")
                            .build();
                    progressEntryRepository.save(entry);
                }
            }
        }

        log.info("Generated roadmap with {} topics, estimated {} weeks",
                roadmapTopics.size(), estimatedWeeks);

        return toResponse(roadmap);
    }

    @Transactional(readOnly = true)
    public RoadmapResponse getRoadmap(UUID roadmapId, UUID userId) {
        DsaRoadmap roadmap = roadmapRepository.findById(roadmapId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("DsaRoadmap", "id", roadmapId));
        return toResponse(roadmap);
    }

    @Transactional(readOnly = true)
    public List<RoadmapResponse> getUserRoadmaps(UUID userId) {
        return roadmapRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private String determineDifficulty(double matchScore) {
        if (matchScore >= 75) return "ADVANCED";
        if (matchScore >= 40) return "INTERMEDIATE";
        return "BEGINNER";
    }

    private List<Map<String, Object>> buildRoadmapTopics(
            List<DsaTopicCatalog.Topic> allTopics,
            SkillAnalysis analysis,
            String difficulty) {

        List<Map<String, Object>> result = new ArrayList<>();
        int order = 1;

        for (DsaTopicCatalog.Topic topic : allTopics) {
            // Filter based on difficulty
            if ("BEGINNER".equals(difficulty) && "HARD".equals(topic.difficulty())) {
                continue; // Skip hard topics for beginners
            }

            Map<String, Object> topicMap = new LinkedHashMap<>();
            topicMap.put("order", order++);
            topicMap.put("name", topic.name());
            topicMap.put("category", topic.category());
            topicMap.put("difficulty", topic.difficulty());
            topicMap.put("subtopics", topic.subtopics());
            topicMap.put("prerequisites", topic.prerequisites());
            topicMap.put("estimatedHours", topic.estimatedHours());
            topicMap.put("resources", topic.resources());
            topicMap.put("priority", calculatePriority(topic, analysis));

            result.add(topicMap);
        }

        // Sort by priority (higher = more important)
        result.sort((a, b) -> {
            int priorityA = ((Number) a.get("priority")).intValue();
            int priorityB = ((Number) b.get("priority")).intValue();
            return Integer.compare(priorityB, priorityA);
        });

        // Re-assign order after sorting
        for (int i = 0; i < result.size(); i++) {
            result.get(i).put("order", i + 1);
        }

        return result;
    }

    /**
     * Calculate topic priority based on missing skills.
     * Topics related to missing skills get higher priority.
     */
    private int calculatePriority(DsaTopicCatalog.Topic topic, SkillAnalysis analysis) {
        int priority = 5; // Base priority

        List<String> missingSkills = analysis.getMissingSkills();
        if (missingSkills == null) return priority;

        // Boost priority if topic is related to missing skills
        for (String missing : missingSkills) {
            String lower = missing.toLowerCase();
            if (topic.name().toLowerCase().contains(lower) ||
                    topic.category().toLowerCase().contains(lower)) {
                priority += 3;
            }
            // Boost DSA topics if "algorithm" or "data structure" is missing
            if ((lower.contains("algorithm") || lower.contains("dsa")) &&
                    (topic.category().equals("ALGORITHMS") || topic.category().equals("DATA_STRUCTURES"))) {
                priority += 2;
            }
            // Boost system design if it's mentioned
            if (lower.contains("system design") && topic.name().equals("System Design")) {
                priority += 5;
            }
        }

        return priority;
    }

    private RoadmapResponse toResponse(DsaRoadmap roadmap) {
        return new RoadmapResponse(
                roadmap.getId(),
                roadmap.getAnalysis() != null ? roadmap.getAnalysis().getId() : null,
                roadmap.getTopics(),
                roadmap.getDifficulty(),
                roadmap.getEstimatedWeeks(),
                roadmap.getCreatedAt()
        );
    }
}

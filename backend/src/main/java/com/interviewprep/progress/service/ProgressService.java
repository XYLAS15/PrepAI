package com.interviewprep.progress.service;

import com.interviewprep.auth.entity.User;
import com.interviewprep.common.exception.ResourceNotFoundException;
import com.interviewprep.progress.dto.DashboardStats;
import com.interviewprep.progress.dto.ProgressUpdateRequest;
import com.interviewprep.progress.entity.ProgressEntry;
import com.interviewprep.progress.repository.ProgressEntryRepository;
import com.interviewprep.resume.repository.ResumeRepository;
import com.interviewprep.jobdesc.repository.JobDescriptionRepository;
import com.interviewprep.interview.repository.MockInterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressService {

    private final ProgressEntryRepository progressRepository;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescRepository;
    private final MockInterviewRepository interviewRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardStats", key = "#userId")
    public DashboardStats getDashboardStats(UUID userId) {
        long totalTopics = progressRepository.countByUserId(userId);
        long completedTopics = progressRepository.countByUserIdAndStatus(userId, "COMPLETED");
        long inProgressTopics = progressRepository.countByUserIdAndStatus(userId, "IN_PROGRESS");
        long resumesAnalyzed = resumeRepository.countByUserId(userId);
        long jobsMatched = jobDescRepository.countByUserId(userId);
        long interviewsTaken = interviewRepository.countByUserId(userId);

        double completionPct = totalTopics > 0 ? (double) completedTopics / totalTopics * 100 : 0;

        return new DashboardStats(
                totalTopics,
                completedTopics,
                inProgressTopics,
                Math.round(completionPct * 100.0) / 100.0,
                resumesAnalyzed,
                jobsMatched,
                interviewsTaken
        );
    }

    @Transactional
    @CacheEvict(value = "dashboardStats", key = "#userId")
    public ProgressEntry updateProgress(UUID entryId, ProgressUpdateRequest request, UUID userId) {
        ProgressEntry entry = progressRepository.findById(entryId)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("ProgressEntry", "id", entryId));

        if (request.status() != null) {
            entry.setStatus(request.status());
            if ("COMPLETED".equals(request.status())) {
                entry.setCompletedAt(Instant.now());
            }
        }
        if (request.notes() != null) {
            entry.setNotes(request.notes());
        }

        return progressRepository.save(entry);
    }

    @Transactional
    @CacheEvict(value = "dashboardStats", key = "#user.id")
    public ProgressEntry createEntry(String topic, String subtopic, UUID roadmapId, User user) {
        ProgressEntry entry = ProgressEntry.builder()
                .user(user)
                .roadmap(null) // Will be set by caller
                .topic(topic)
                .subtopic(subtopic)
                .status("NOT_STARTED")
                .build();
        return progressRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<ProgressEntry> getRoadmapProgress(UUID roadmapId) {
        return progressRepository.findByRoadmapIdOrderByTopic(roadmapId);
    }

    @Transactional(readOnly = true)
    public List<ProgressEntry> getUserProgress(UUID userId) {
        return progressRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}

package com.interviewprep.progress.repository;

import com.interviewprep.progress.entity.ProgressEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProgressEntryRepository extends JpaRepository<ProgressEntry, UUID> {

    List<ProgressEntry> findByRoadmapIdOrderByTopic(UUID roadmapId);

    List<ProgressEntry> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndStatus(UUID userId, String status);

    long countByUserId(UUID userId);

    @Query("SELECT DISTINCT p.topic FROM ProgressEntry p WHERE p.user.id = :userId AND p.status = 'COMPLETED'")
    List<String> findCompletedTopicsByUserId(UUID userId);
}

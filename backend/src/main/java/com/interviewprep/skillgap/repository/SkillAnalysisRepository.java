package com.interviewprep.skillgap.repository;

import com.interviewprep.skillgap.entity.SkillAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillAnalysisRepository extends JpaRepository<SkillAnalysis, UUID> {

    List<SkillAnalysis> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<SkillAnalysis> findByResumeIdAndJobDescriptionId(UUID resumeId, UUID jobDescId);
}

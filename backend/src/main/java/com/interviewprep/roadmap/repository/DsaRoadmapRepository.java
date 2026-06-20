package com.interviewprep.roadmap.repository;

import com.interviewprep.roadmap.entity.DsaRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DsaRoadmapRepository extends JpaRepository<DsaRoadmap, UUID> {

    List<DsaRoadmap> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

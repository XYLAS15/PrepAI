package com.interviewprep.jobdesc.repository;

import com.interviewprep.jobdesc.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, UUID> {

    List<JobDescription> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);
}

package com.interviewprep.interview.repository;

import com.interviewprep.interview.entity.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MockInterviewRepository extends JpaRepository<MockInterview, UUID> {
    List<MockInterview> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserId(UUID userId);
}

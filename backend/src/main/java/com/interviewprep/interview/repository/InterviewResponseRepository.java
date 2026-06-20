package com.interviewprep.interview.repository;

import com.interviewprep.interview.entity.InterviewResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewResponseRepository extends JpaRepository<InterviewResponse, UUID> {
    List<InterviewResponse> findByInterviewIdOrderByQuestionIndex(UUID interviewId);
}

package com.interviewprep.interview.service;

import com.interviewprep.auth.entity.User;
import com.interviewprep.common.event.InterviewProcessingRequested;
import com.interviewprep.common.exception.ResourceNotFoundException;
import com.interviewprep.interview.dto.*;
import com.interviewprep.interview.entity.MockInterview;
import com.interviewprep.interview.repository.InterviewResponseRepository;
import com.interviewprep.interview.repository.MockInterviewRepository;
import com.interviewprep.jobdesc.entity.JobDescription;
import com.interviewprep.jobdesc.repository.JobDescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final MockInterviewRepository interviewRepository;
    private final InterviewResponseRepository responseRepository;
    private final JobDescriptionRepository jobDescRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public com.interviewprep.interview.dto.InterviewResponse generateInterview(
            InterviewGenerateRequest request, User user) {

        JobDescription jd = jobDescRepository.findById(request.jobDescId())
                .filter(j -> j.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("JobDescription", "id", request.jobDescId()));

        if (!"COMPLETED".equals(jd.getStatus())) {
            throw new IllegalStateException("Job description must be analyzed before generating interview");
        }

        String type = request.interviewType() != null ? request.interviewType() : "TECHNICAL";

        MockInterview interview = MockInterview.builder()
                .user(user)
                .jobDescription(jd)
                .interviewType(type)
                .status("PROCESSING")
                .build();

        interview = interviewRepository.save(interview);

        eventPublisher.publishEvent(new InterviewProcessingRequested(
                interview.getId(), type, jd.getParsedData(), user.getId()));

        return toResponse(interview);
    }

    @Transactional
    public void submitAnswer(UUID interviewId, AnswerSubmitRequest request, UUID userId) {
        MockInterview interview = interviewRepository.findById(interviewId)
                .filter(i -> i.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("MockInterview", "id", interviewId));

        com.interviewprep.interview.entity.InterviewResponse response =
                com.interviewprep.interview.entity.InterviewResponse.builder()
                        .interview(interview)
                        .questionIndex(request.questionIndex())
                        .userAnswer(request.userAnswer())
                        .score(request.score())
                        .timeSpentSec(request.timeSpentSec())
                        .build();

        responseRepository.save(response);
    }

    @Transactional(readOnly = true)
    public com.interviewprep.interview.dto.InterviewResponse getInterview(UUID interviewId, UUID userId) {
        MockInterview interview = interviewRepository.findById(interviewId)
                .filter(i -> i.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("MockInterview", "id", interviewId));
        return toResponse(interview);
    }

    @Transactional(readOnly = true)
    public List<com.interviewprep.interview.dto.InterviewResponse> getUserInterviews(UUID userId) {
        return interviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private com.interviewprep.interview.dto.InterviewResponse toResponse(MockInterview interview) {
        return new com.interviewprep.interview.dto.InterviewResponse(
                interview.getId(),
                interview.getJobDescription() != null ? interview.getJobDescription().getId() : null,
                interview.getInterviewType(),
                interview.getStatus(),
                interview.getQuestions(),
                interview.getCreatedAt()
        );
    }
}

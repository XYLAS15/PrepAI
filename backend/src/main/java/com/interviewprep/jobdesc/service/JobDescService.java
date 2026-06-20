package com.interviewprep.jobdesc.service;

import com.interviewprep.auth.entity.User;
import com.interviewprep.common.event.JobDescriptionProcessingRequested;
import com.interviewprep.common.exception.ResourceNotFoundException;
import com.interviewprep.jobdesc.dto.*;
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
public class JobDescService {

    private final JobDescriptionRepository jobDescRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public JobDescriptionResponse createJobDescription(JobDescriptionRequest request, User user) {
        JobDescription jd = JobDescription.builder()
                .user(user)
                .title(request.title())
                .company(request.company())
                .rawText(request.rawText())
                .status("PROCESSING")
                .build();

        jd = jobDescRepository.save(jd);
        eventPublisher.publishEvent(new JobDescriptionProcessingRequested(
                jd.getId(), request.rawText(), user.getId()));

        return toResponse(jd);
    }

    @Transactional(readOnly = true)
    public JobDescriptionResponse getJobDescription(UUID jdId, UUID userId) {
        JobDescription jd = jobDescRepository.findById(jdId)
                .filter(j -> j.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("JobDescription", "id", jdId));
        return toResponse(jd);
    }

    @Transactional(readOnly = true)
    public List<JobDescriptionResponse> getUserJobDescriptions(UUID userId) {
        return jobDescRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteJobDescription(UUID jdId, UUID userId) {
        JobDescription jd = jobDescRepository.findById(jdId)
                .filter(j -> j.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("JobDescription", "id", jdId));
        jobDescRepository.delete(jd);
    }

    private JobDescriptionResponse toResponse(JobDescription jd) {
        return new JobDescriptionResponse(
                jd.getId(),
                jd.getTitle(),
                jd.getCompany(),
                jd.getStatus(),
                jd.getParsedData(),
                jd.getCreatedAt()
        );
    }
}

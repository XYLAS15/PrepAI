package com.interviewprep.jobdesc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewprep.common.event.JobDescriptionProcessingRequested;
import com.interviewprep.jobdesc.dto.JobRequirements;
import com.interviewprep.jobdesc.repository.JobDescriptionRepository;
import com.interviewprep.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobDescriptionProcessingListener {
    private final JobDescriptionRepository repository;
    private final JobDescAiService aiService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void process(JobDescriptionProcessingRequested event) {
        try {
            JobRequirements requirements = aiService.parseJobDescription(event.rawText());
            @SuppressWarnings("unchecked")
            Map<String, Object> parsedData = objectMapper.convertValue(requirements, Map.class);
            var jobDescription = repository.findById(event.jobDescriptionId()).orElseThrow();
            jobDescription.setParsedData(parsedData);
            jobDescription.setStatus("COMPLETED");
            if (jobDescription.getTitle() == null || jobDescription.getTitle().isBlank()) {
                jobDescription.setTitle(requirements.jobTitle());
            }
            if (jobDescription.getCompany() == null || jobDescription.getCompany().isBlank()) {
                jobDescription.setCompany(requirements.company());
            }
            repository.save(jobDescription);
            notificationService.createNotification(event.userId(), "JD_ANALYZED", "Job Description Analyzed",
                    "Job description for '" + requirements.jobTitle() + "' has been analyzed.");
        } catch (Exception ex) {
            log.error("Failed to process job description {}", event.jobDescriptionId(), ex);
            repository.findById(event.jobDescriptionId()).ifPresent(jobDescription -> {
                jobDescription.setStatus("FAILED");
                repository.save(jobDescription);
            });
        }
    }
}

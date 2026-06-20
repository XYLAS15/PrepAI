package com.interviewprep.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewprep.common.event.ResumeProcessingRequested;
import com.interviewprep.notification.service.NotificationService;
import com.interviewprep.resume.dto.ResumeProfile;
import com.interviewprep.resume.repository.ResumeRepository;
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
public class ResumeProcessingListener {
    private final ResumeRepository resumeRepository;
    private final ResumeAiService resumeAiService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void process(ResumeProcessingRequested event) {
        try {
            ResumeProfile profile = resumeAiService.parseResume(event.rawText());
            @SuppressWarnings("unchecked")
            Map<String, Object> parsedData = objectMapper.convertValue(profile, Map.class);
            var resume = resumeRepository.findById(event.resumeId()).orElseThrow();
            resume.setParsedData(parsedData);
            resume.setStatus("COMPLETED");
            resumeRepository.save(resume);
            notificationService.createNotification(event.userId(), "RESUME_PARSED", "Resume Analyzed",
                    "Your resume '" + resume.getFileName() + "' has been successfully analyzed.");
        } catch (Exception ex) {
            log.error("Failed to process resume {}", event.resumeId(), ex);
            resumeRepository.findById(event.resumeId()).ifPresent(resume -> {
                resume.setStatus("FAILED");
                resumeRepository.save(resume);
            });
            notificationService.createNotification(event.userId(), "RESUME_FAILED", "Resume Analysis Failed",
                    "We couldn't analyze your resume. Please try uploading again.");
        }
    }
}

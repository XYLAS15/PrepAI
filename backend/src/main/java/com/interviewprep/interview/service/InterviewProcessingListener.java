package com.interviewprep.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewprep.common.event.InterviewProcessingRequested;
import com.interviewprep.interview.dto.InterviewQuestion;
import com.interviewprep.interview.repository.MockInterviewRepository;
import com.interviewprep.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InterviewProcessingListener {
    private final MockInterviewRepository repository;
    private final InterviewAiService aiService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void process(InterviewProcessingRequested event) {
        try {
            List<InterviewQuestion> questions = aiService.generateQuestions(
                    event.interviewType(), event.jobDetails());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questionData = objectMapper.convertValue(questions,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
            var interview = repository.findById(event.interviewId()).orElseThrow();
            interview.setQuestions(questionData);
            interview.setStatus("COMPLETED");
            repository.save(interview);
            notificationService.createNotification(event.userId(), "INTERVIEW_READY", "Mock Interview Ready",
                    "Your " + event.interviewType() + " interview questions are ready. Start practicing!");
        } catch (Exception ex) {
            log.error("Failed to generate interview {}", event.interviewId(), ex);
            repository.findById(event.interviewId()).ifPresent(interview -> {
                interview.setStatus("FAILED");
                repository.save(interview);
            });
        }
    }
}

package com.interviewprep.resume.service;

import com.interviewprep.auth.entity.User;
import com.interviewprep.common.event.ResumeProcessingRequested;
import com.interviewprep.resume.entity.Resume;
import com.interviewprep.resume.repository.ResumeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {
    @Mock ResumeRepository repository;
    @Mock ResumeTextExtractor textExtractor;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock MultipartFile file;

    @Test
    void publishesProcessingRequestAfterCreatingResume() throws Exception {
        UUID resumeId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com")
                .passwordHash("hash").fullName("User").build();
        when(file.getOriginalFilename()).thenReturn("resume.pdf");
        when(textExtractor.extractText(file)).thenReturn("resume text");
        when(repository.save(any(Resume.class))).thenAnswer(invocation -> {
            Resume resume = invocation.getArgument(0);
            resume.setId(resumeId);
            return resume;
        });

        var service = new ResumeService(repository, textExtractor, eventPublisher);
        var response = service.uploadResume(file, user);

        assertThat(response.id()).isEqualTo(resumeId);
        assertThat(response.status()).isEqualTo("PROCESSING");
        ArgumentCaptor<ResumeProcessingRequested> event =
                ArgumentCaptor.forClass(ResumeProcessingRequested.class);
        verify(eventPublisher).publishEvent(event.capture());
        assertThat(event.getValue()).isEqualTo(
                new ResumeProcessingRequested(resumeId, "resume text", userId));
    }
}

package com.interviewprep.resume.service;

import com.interviewprep.auth.entity.User;
import com.interviewprep.common.event.ResumeProcessingRequested;
import com.interviewprep.common.exception.ResourceNotFoundException;
import com.interviewprep.resume.dto.ResumeResponse;
import com.interviewprep.resume.entity.Resume;
import com.interviewprep.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeTextExtractor textExtractor;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ResumeResponse uploadResume(MultipartFile file, User user) throws IOException {
        // 1. Extract text from the uploaded file
        String rawText = textExtractor.extractText(file);

        // 2. Save initial resume record with PROCESSING status
        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .rawText(rawText)
                .status("PROCESSING")
                .build();

        resume = resumeRepository.save(resume);
        eventPublisher.publishEvent(new ResumeProcessingRequested(resume.getId(), rawText, user.getId()));

        return toResponse(resume);
    }

    @Transactional(readOnly = true)
    public ResumeResponse getResume(UUID resumeId, UUID userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));
        return toResponse(resume);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getUserResumes(UUID userId) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteResume(UUID resumeId, UUID userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));
        resumeRepository.delete(resume);
    }

    private ResumeResponse toResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getStatus(),
                resume.getParsedData(),
                resume.getCreatedAt()
        );
    }
}

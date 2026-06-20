package com.interviewprep.resume.controller;

import com.interviewprep.auth.entity.User;
import com.interviewprep.resume.dto.ResumeResponse;
import com.interviewprep.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {

        ResumeResponse response = resumeService.uploadResume(file, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResume(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        ResumeResponse response = resumeService.getResume(id, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getUserResumes(
            @AuthenticationPrincipal User user) {

        List<ResumeResponse> resumes = resumeService.getUserResumes(user.getId());
        return ResponseEntity.ok(resumes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        resumeService.deleteResume(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}

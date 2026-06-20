package com.interviewprep.jobdesc.controller;

import com.interviewprep.auth.entity.User;
import com.interviewprep.jobdesc.dto.*;
import com.interviewprep.jobdesc.service.JobDescService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-descriptions")
@RequiredArgsConstructor
public class JobDescController {

    private final JobDescService jobDescService;

    @PostMapping
    public ResponseEntity<JobDescriptionResponse> create(
            @Valid @RequestBody JobDescriptionRequest request,
            @AuthenticationPrincipal User user) {

        JobDescriptionResponse response = jobDescService.createJobDescription(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDescriptionResponse> get(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(jobDescService.getJobDescription(id, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<JobDescriptionResponse>> list(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(jobDescService.getUserJobDescriptions(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        jobDescService.deleteJobDescription(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}

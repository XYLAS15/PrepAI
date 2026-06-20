package com.interviewprep.interview.controller;

import com.interviewprep.auth.entity.User;
import com.interviewprep.interview.dto.*;
import com.interviewprep.interview.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/generate")
    public ResponseEntity<InterviewResponse> generate(
            @Valid @RequestBody InterviewGenerateRequest request,
            @AuthenticationPrincipal User user) {

        InterviewResponse response = interviewService.generateInterview(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponse> get(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(interviewService.getInterview(id, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<InterviewResponse>> list(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(interviewService.getUserInterviews(user.getId()));
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<Void> submitAnswer(
            @PathVariable UUID id,
            @Valid @RequestBody AnswerSubmitRequest request,
            @AuthenticationPrincipal User user) {

        interviewService.submitAnswer(id, request, user.getId());
        return ResponseEntity.ok().build();
    }
}

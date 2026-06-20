package com.interviewprep.assistant.controller;

import com.interviewprep.assistant.dto.*;
import com.interviewprep.assistant.service.AssistantService;
import com.interviewprep.auth.entity.User;
import com.interviewprep.questionbank.dto.QuestionBankDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
public class AssistantController {
    private final AssistantService assistantService;

    @PostMapping("/answer-feedback")
    public ResponseEntity<AnswerFeedbackResponse> evaluateAnswer(
            @Valid @RequestBody AnswerFeedbackRequest request) {
        return ResponseEntity.ok(assistantService.evaluateAnswer(request));
    }

    @PostMapping("/ats-score")
    public ResponseEntity<AtsScoreResponse> scoreResume(
            @Valid @RequestBody AtsScoreRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assistantService.scoreResume(request, user));
    }

    @PostMapping("/questions")
    public ResponseEntity<List<QuestionBankDto>> generateQuestions(
            @Valid @RequestBody QuestionGenerationRequest request) {
        return ResponseEntity.ok(assistantService.generateQuestions(request));
    }
}

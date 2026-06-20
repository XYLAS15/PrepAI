package com.interviewprep.skillgap.controller;

import com.interviewprep.auth.entity.User;
import com.interviewprep.skillgap.dto.*;
import com.interviewprep.skillgap.service.SkillGapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/skill-gap")
@RequiredArgsConstructor
public class SkillGapController {

    private final SkillGapService skillGapService;

    @PostMapping("/analyze")
    public ResponseEntity<SkillGapResponse> analyze(
            @Valid @RequestBody SkillGapRequest request,
            @AuthenticationPrincipal User user) {

        SkillGapResponse response = skillGapService.analyzeSkillGap(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SkillGapResponse> get(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(skillGapService.getAnalysis(id, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<SkillGapResponse>> list(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(skillGapService.getUserAnalyses(user.getId()));
    }
}

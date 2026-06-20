package com.interviewprep.progress.controller;

import com.interviewprep.auth.entity.User;
import com.interviewprep.progress.dto.DashboardStats;
import com.interviewprep.progress.dto.ProgressUpdateRequest;
import com.interviewprep.progress.entity.ProgressEntry;
import com.interviewprep.progress.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(progressService.getDashboardStats(user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ProgressEntry>> getUserProgress(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(progressService.getUserProgress(user.getId()));
    }

    @GetMapping("/roadmap/{roadmapId}")
    public ResponseEntity<List<ProgressEntry>> getRoadmapProgress(
            @PathVariable UUID roadmapId) {

        return ResponseEntity.ok(progressService.getRoadmapProgress(roadmapId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressEntry> updateProgress(
            @PathVariable UUID id,
            @RequestBody ProgressUpdateRequest request,
            @AuthenticationPrincipal User user) {

        ProgressEntry updated = progressService.updateProgress(id, request, user.getId());
        return ResponseEntity.ok(updated);
    }
}

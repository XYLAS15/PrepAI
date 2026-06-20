package com.interviewprep.roadmap.controller;

import com.interviewprep.auth.entity.User;
import com.interviewprep.roadmap.dto.RoadmapResponse;
import com.interviewprep.roadmap.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping("/generate")
    public ResponseEntity<RoadmapResponse> generate(
            @RequestParam UUID analysisId,
            @AuthenticationPrincipal User user) {

        RoadmapResponse response = roadmapService.generateRoadmap(analysisId, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoadmapResponse> get(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(roadmapService.getRoadmap(id, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<RoadmapResponse>> list(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(roadmapService.getUserRoadmaps(user.getId()));
    }
}

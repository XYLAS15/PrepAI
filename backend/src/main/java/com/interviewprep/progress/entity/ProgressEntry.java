package com.interviewprep.progress.entity;

import com.interviewprep.auth.entity.User;
import com.interviewprep.roadmap.entity.DsaRoadmap;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "progress_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProgressEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private DsaRoadmap roadmap;

    @Column(nullable = false)
    private String topic;

    private String subtopic;

    @Column(nullable = false)
    @Builder.Default
    private String status = "NOT_STARTED";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "completed_at")
    private Instant completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}

package com.interviewprep.roadmap.entity;

import com.interviewprep.auth.entity.User;
import com.interviewprep.skillgap.entity.SkillAnalysis;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "dsa_roadmaps")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DsaRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id")
    private SkillAnalysis analysis;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "topics", columnDefinition = "jsonb")
    private List<Map<String, Object>> topics;

    @Column(nullable = false)
    @Builder.Default
    private String difficulty = "INTERMEDIATE";

    @Column(name = "estimated_weeks")
    private int estimatedWeeks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}

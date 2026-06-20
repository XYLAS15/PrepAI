package com.interviewprep.skillgap.entity;

import com.interviewprep.auth.entity.User;
import com.interviewprep.jobdesc.entity.JobDescription;
import com.interviewprep.resume.entity.Resume;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "skill_analyses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SkillAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_desc_id", nullable = false)
    private JobDescription jobDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matching_skills", columnDefinition = "jsonb")
    private List<String> matchingSkills;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "missing_skills", columnDefinition = "jsonb")
    private List<String> missingSkills;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extra_skills", columnDefinition = "jsonb")
    private List<String> extraSkills;

    @Column(name = "match_score", precision = 5, scale = 2)
    private BigDecimal matchScore;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}

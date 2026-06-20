package com.interviewprep.interview.entity;

import com.interviewprep.auth.entity.User;
import com.interviewprep.jobdesc.entity.JobDescription;
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
@Table(name = "mock_interviews")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MockInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_desc_id")
    private JobDescription jobDescription;

    @Column(name = "interview_type", nullable = false)
    @Builder.Default
    private String interviewType = "TECHNICAL";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "questions", columnDefinition = "jsonb")
    @Builder.Default
    private List<Map<String, Object>> questions = new java.util.ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}

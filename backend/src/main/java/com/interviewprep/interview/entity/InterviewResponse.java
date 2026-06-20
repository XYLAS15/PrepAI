package com.interviewprep.interview.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interview_responses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InterviewResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private MockInterview interview;

    @Column(name = "question_index", nullable = false)
    private int questionIndex;

    @Column(name = "user_answer", columnDefinition = "TEXT")
    private String userAnswer;

    private Integer score;

    @Column(name = "time_spent_sec")
    private Integer timeSpentSec;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}

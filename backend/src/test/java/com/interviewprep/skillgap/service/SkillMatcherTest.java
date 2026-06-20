package com.interviewprep.skillgap.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SkillMatcherTest {
    private final SkillMatcher matcher = new SkillMatcher();

    @Test
    void comparesAliasesAndReportsMissingAndExtraSkills() {
        var result = matcher.compare(
                List.of("react.js", "postgres", "Docker"),
                List.of("React", "PostgreSQL", "Kubernetes"));

        assertThat(result.matching()).containsExactlyInAnyOrder("React", "PostgreSQL");
        assertThat(result.missing()).containsExactly("Kubernetes");
        assertThat(result.extra()).containsExactly("Docker");
        assertThat(result.matchScore()).isEqualTo(66.67);
    }

    @Test
    void emptyRequirementsProduceZeroScore() {
        assertThat(matcher.compare(List.of("Java"), List.of()).matchScore()).isZero();
    }
}

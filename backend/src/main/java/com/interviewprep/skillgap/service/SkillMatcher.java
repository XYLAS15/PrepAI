package com.interviewprep.skillgap.service;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Pure backend logic — NO AI calls.
 * Matches skills using exact match, case-insensitive match,
 * fuzzy matching (Levenshtein distance), and synonym resolution.
 */
@Component
public class SkillMatcher {

    // Synonym map: maps variations to canonical skill names
    private static final Map<String, String> SYNONYMS = Map.ofEntries(
            Map.entry("reactjs", "React"),
            Map.entry("react.js", "React"),
            Map.entry("react js", "React"),
            Map.entry("nodejs", "Node.js"),
            Map.entry("node", "Node.js"),
            Map.entry("node.js", "Node.js"),
            Map.entry("js", "JavaScript"),
            Map.entry("javascript", "JavaScript"),
            Map.entry("ts", "TypeScript"),
            Map.entry("typescript", "TypeScript"),
            Map.entry("python3", "Python"),
            Map.entry("py", "Python"),
            Map.entry("golang", "Go"),
            Map.entry("postgres", "PostgreSQL"),
            Map.entry("postgresql", "PostgreSQL"),
            Map.entry("mongo", "MongoDB"),
            Map.entry("mongodb", "MongoDB"),
            Map.entry("aws", "AWS"),
            Map.entry("amazon web services", "AWS"),
            Map.entry("gcp", "Google Cloud"),
            Map.entry("google cloud platform", "Google Cloud"),
            Map.entry("k8s", "Kubernetes"),
            Map.entry("kubernetes", "Kubernetes"),
            Map.entry("docker", "Docker"),
            Map.entry("ci/cd", "CI/CD"),
            Map.entry("cicd", "CI/CD"),
            Map.entry("ml", "Machine Learning"),
            Map.entry("machine learning", "Machine Learning"),
            Map.entry("dl", "Deep Learning"),
            Map.entry("deep learning", "Deep Learning"),
            Map.entry("spring boot", "Spring Boot"),
            Map.entry("springboot", "Spring Boot"),
            Map.entry("angular", "Angular"),
            Map.entry("angularjs", "Angular"),
            Map.entry("vue", "Vue.js"),
            Map.entry("vuejs", "Vue.js"),
            Map.entry("vue.js", "Vue.js"),
            Map.entry("sql", "SQL"),
            Map.entry("mysql", "MySQL"),
            Map.entry("redis", "Redis"),
            Map.entry("kafka", "Apache Kafka"),
            Map.entry("apache kafka", "Apache Kafka"),
            Map.entry("rest", "REST APIs"),
            Map.entry("restful", "REST APIs"),
            Map.entry("rest api", "REST APIs"),
            Map.entry("graphql", "GraphQL"),
            Map.entry("git", "Git"),
            Map.entry("github", "GitHub"),
            Map.entry("terraform", "Terraform"),
            Map.entry("java", "Java"),
            Map.entry("c++", "C++"),
            Map.entry("cpp", "C++"),
            Map.entry("c#", "C#"),
            Map.entry("csharp", "C#"),
            Map.entry("dotnet", ".NET"),
            Map.entry(".net", ".NET")
    );

    /**
     * Normalizes a skill name to its canonical form.
     */
    public String normalize(String skill) {
        String lower = skill.trim().toLowerCase();
        return SYNONYMS.getOrDefault(lower, skill.trim());
    }

    /**
     * Checks if two skill names match (considering synonyms and fuzzy matching).
     */
    public boolean isMatch(String skill1, String skill2) {
        String norm1 = normalize(skill1).toLowerCase();
        String norm2 = normalize(skill2).toLowerCase();

        // Exact match after normalization
        if (norm1.equals(norm2)) return true;

        // Containment match (e.g., "Spring Boot" contains "Spring")
        if (norm1.contains(norm2) || norm2.contains(norm1)) return true;

        // Levenshtein distance for typo tolerance (threshold: 2 for short, 3 for long)
        int threshold = Math.min(norm1.length(), norm2.length()) > 6 ? 3 : 2;
        return levenshteinDistance(norm1, norm2) <= threshold;
    }

    /**
     * Compares two skill sets and returns matching, missing, and extra skills.
     */
    public SkillComparison compare(List<String> resumeSkills, List<String> requiredSkills) {
        Set<String> normalizedResume = resumeSkills.stream()
                .map(this::normalize)
                .collect(Collectors.toSet());

        Set<String> normalizedRequired = requiredSkills.stream()
                .map(this::normalize)
                .collect(Collectors.toSet());

        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String required : normalizedRequired) {
            boolean found = normalizedResume.stream()
                    .anyMatch(resume -> isMatch(resume, required));
            if (found) {
                matching.add(required);
            } else {
                missing.add(required);
            }
        }

        List<String> extra = normalizedResume.stream()
                .filter(resume -> normalizedRequired.stream()
                        .noneMatch(req -> isMatch(resume, req)))
                .toList();

        double score = normalizedRequired.isEmpty() ? 0 :
                (double) matching.size() / normalizedRequired.size() * 100;

        return new SkillComparison(matching, missing, extra, Math.round(score * 100.0) / 100.0);
    }

    /**
     * Standard Levenshtein distance algorithm.
     */
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost);
            }
        }

        return dp[s1.length()][s2.length()];
    }

    public record SkillComparison(
            List<String> matching,
            List<String> missing,
            List<String> extra,
            double matchScore
    ) {}
}

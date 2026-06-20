package com.interviewprep.questionbank.dto;

import java.util.List;
import java.util.UUID;

public record QuestionBankDto(
    UUID id,
    String category,
    String difficulty,
    String title,
    String description,
    List<String> hints,
    List<String> tags,
    String leetcodeUrl
) {}

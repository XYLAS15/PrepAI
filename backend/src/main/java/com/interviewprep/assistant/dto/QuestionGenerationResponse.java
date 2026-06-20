package com.interviewprep.assistant.dto;

import com.interviewprep.questionbank.dto.QuestionBankDto;
import java.util.List;

public record QuestionGenerationResponse(List<QuestionBankDto> questions) {}

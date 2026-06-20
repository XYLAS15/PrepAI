package com.interviewprep.questionbank.controller;

import com.interviewprep.questionbank.dto.QuestionBankDto;
import com.interviewprep.questionbank.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question-bank")
@RequiredArgsConstructor
public class QuestionBankController {

    private final QuestionBankService service;

    @GetMapping
    public ResponseEntity<List<QuestionBankDto>> getAllQuestions() {
        return ResponseEntity.ok(service.getAllQuestions());
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<QuestionBankDto>> saveBulkQuestions(@RequestBody List<QuestionBankDto> questions) {
        return ResponseEntity.ok(service.saveBulkQuestions(questions));
    }
}

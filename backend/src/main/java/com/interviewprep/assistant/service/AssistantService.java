package com.interviewprep.assistant.service;

import com.interviewprep.assistant.dto.*;
import com.interviewprep.auth.entity.User;
import com.interviewprep.common.exception.AiProcessingException;
import com.interviewprep.common.exception.ResourceNotFoundException;
import com.interviewprep.jobdesc.repository.JobDescriptionRepository;
import com.interviewprep.questionbank.dto.QuestionBankDto;
import com.interviewprep.questionbank.service.QuestionBankService;
import com.interviewprep.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssistantService {
    private final ChatClient chatClient;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final QuestionBankService questionBankService;

    public AnswerFeedbackResponse evaluateAnswer(AnswerFeedbackRequest request) {
        String prompt = """
                Evaluate this interview answer as a senior technical interviewer.
                Score it from 1 to 10 and return structured feedback. Do not invent facts.

                Question: {question}
                Category: {category}
                Difficulty: {difficulty}
                Candidate answer: {answer}
                """;
        return call(() -> chatClient.prompt().user(user -> user.text(prompt)
                .param("question", request.question())
                .param("category", request.category())
                .param("difficulty", request.difficulty())
                .param("answer", request.userAnswer()))
                .call().entity(AnswerFeedbackResponse.class));
    }

    @Transactional(readOnly = true)
    public AtsScoreResponse scoreResume(AtsScoreRequest request, User user) {
        var resume = resumeRepository.findById(request.resumeId())
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", request.resumeId()));
        var jobDescription = jobDescriptionRepository.findById(request.jobDescId())
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("JobDescription", "id", request.jobDescId()));
        if (!"COMPLETED".equals(resume.getStatus()) || !"COMPLETED".equals(jobDescription.getStatus())) {
            throw new IllegalStateException("Resume and job description analysis must be completed first");
        }

        String prompt = """
                Act as a rigorous ATS and recruiter. Compare only the supplied resume with the supplied
                job description. Present keywords must occur in both inputs; missing keywords must be
                requested by the job description and absent from the resume.
                
                Score keywordScore, formatScore, and relevanceScore each on a scale of 0 to 100 (where 100 is perfect).
                Calculate overallScore as the rounded average of keywordScore, formatScore, and relevanceScore (also 0 to 100).
                
                Return at least five specific suggestions and feedback for summary, experience, skills, education, and projects.
                For suggestions, the priority MUST be exactly "High", "Medium", or "Low" (capitalized).

                RESUME:
                {resume}

                JOB DESCRIPTION:
                {jobDescription}
                """;
        return call(() -> chatClient.prompt().user(message -> message.text(prompt)
                .param("resume", resume.getRawText())
                .param("jobDescription", jobDescription.getRawText()))
                .call().entity(AtsScoreResponse.class));
    }

    public List<QuestionBankDto> generateQuestions(QuestionGenerationRequest request) {
        String prompt = """
                Generate five unique, high-quality interview questions for category {category}.
                Use Easy, Medium, or Hard difficulty. Include useful hints and tags. Use a LeetCode URL
                only when it is a known matching problem. Return the questions in the requested structure.
                """;
        QuestionGenerationResponse generated = call(() -> chatClient.prompt().user(message -> message.text(prompt)
                .param("category", request.category()))
                .call().entity(QuestionGenerationResponse.class));
        if (generated == null || generated.questions() == null || generated.questions().isEmpty()) {
            throw new AiProcessingException("AI returned no questions");
        }
        List<QuestionBankDto> sanitized = generated.questions().stream()
                .map(question -> new QuestionBankDto(null, request.category(), question.difficulty(),
                        question.title(), question.description(), question.hints(), question.tags(),
                        question.leetcodeUrl()))
                .toList();
        return questionBankService.saveBulkQuestions(sanitized);
    }

    private <T> T call(AiCall<T> operation) {
        try {
            T response = operation.execute();
            if (response == null) throw new IllegalStateException("Empty AI response");
            return response;
        } catch (AiProcessingException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AiProcessingException("AI request failed", ex);
        }
    }

    @FunctionalInterface
    private interface AiCall<T> {
        T execute();
    }
}

package com.interviewprep.questionbank.repository;

import com.interviewprep.questionbank.entity.QuestionBankEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBankEntry, UUID> {
}

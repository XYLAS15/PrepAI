package com.interviewprep.resume.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class ResumeTextExtractor {

    /**
     * Extracts text content from uploaded resume file.
     * Supports PDF and plain text formats.
     */
    public String extractText(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();

        if (fileName != null && fileName.toLowerCase().endsWith(".pdf")) {
            return extractFromPdf(file);
        } else if (fileName != null && (fileName.toLowerCase().endsWith(".txt")
                || fileName.toLowerCase().endsWith(".text"))) {
            return extractFromText(file);
        } else {
            throw new IllegalArgumentException(
                    "Unsupported file format. Please upload a PDF or TXT file.");
        }
    }

    private String extractFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            log.info("Extracted {} characters from PDF", text.length());
            return text.trim();
        }
    }

    private String extractFromText(MultipartFile file) throws IOException {
        String text = new String(file.getBytes(), StandardCharsets.UTF_8);
        log.info("Read {} characters from text file", text.length());
        return text.trim();
    }
}

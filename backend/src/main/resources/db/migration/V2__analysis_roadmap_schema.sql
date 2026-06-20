-- V2: Analysis & Roadmap Schema
-- ==============================

-- Skill Gap Analysis
CREATE TABLE skill_analyses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id       UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    job_desc_id     UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    matching_skills JSONB NOT NULL DEFAULT '[]',
    missing_skills  JSONB NOT NULL DEFAULT '[]',
    extra_skills    JSONB NOT NULL DEFAULT '[]',
    match_score     DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_skill_analyses_user_id ON skill_analyses(user_id);
CREATE UNIQUE INDEX idx_skill_analyses_resume_jd ON skill_analyses(resume_id, job_desc_id);

-- DSA Roadmaps
CREATE TABLE dsa_roadmaps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id     UUID REFERENCES skill_analyses(id) ON DELETE SET NULL,
    topics          JSONB NOT NULL DEFAULT '[]',
    difficulty      VARCHAR(20) NOT NULL DEFAULT 'INTERMEDIATE',
    estimated_weeks INT NOT NULL DEFAULT 4,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dsa_roadmaps_user_id ON dsa_roadmaps(user_id);

-- Progress Entries
CREATE TABLE progress_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roadmap_id      UUID NOT NULL REFERENCES dsa_roadmaps(id) ON DELETE CASCADE,
    topic           VARCHAR(100) NOT NULL,
    subtopic        VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'NOT_STARTED' NOT NULL,
    notes           TEXT,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX idx_progress_entries_roadmap_id ON progress_entries(roadmap_id);

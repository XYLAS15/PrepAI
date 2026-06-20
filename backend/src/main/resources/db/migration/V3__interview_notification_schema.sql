-- V3: Interview & Notification Schema
-- ====================================

-- Mock Interviews
CREATE TABLE mock_interviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_desc_id     UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
    interview_type  VARCHAR(50) NOT NULL DEFAULT 'TECHNICAL',
    questions       JSONB NOT NULL DEFAULT '[]',
    status          VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mock_interviews_user_id ON mock_interviews(user_id);

-- Interview Responses
CREATE TABLE interview_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id    UUID NOT NULL REFERENCES mock_interviews(id) ON DELETE CASCADE,
    question_index  INT NOT NULL,
    user_answer     TEXT,
    score           INT CHECK (score >= 1 AND score <= 5),
    time_spent_sec  INT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_responses_interview_id ON interview_responses(interview_id);

-- Notifications
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    is_read         BOOLEAN DEFAULT FALSE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(500) UNIQUE NOT NULL,
    expiry_date     TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

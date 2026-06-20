# 🎯 AI-Powered Interview Preparation Platform

A full-stack platform where users upload resumes and target job descriptions, receive AI-powered skill gap analysis, personalized DSA roadmaps, mock interview questions, and progress tracking.

## 🏗️ Architecture

```
React (Vite + TypeScript)
       │
Spring Boot 3.4 (Java 17)
       │
┌──────┼──────┐
│      │      │
PostgreSQL       Redis
       │
   Spring AI (Groq)
```

### AI Call Points

| Trigger | Action | Output |
|---------|--------|--------|
| Resume uploaded | Parse skills/experience | Structured `ResumeProfile` |
| JD uploaded | Extract requirements | Structured `JobRequirements` |
| Interview requested | Generate questions | `List<InterviewQuestion>` |
| Answer feedback requested | Evaluate a practice answer | Structured feedback |
| ATS score requested | Compare a stored resume and JD | Score and suggestions |
| Practice questions requested | Generate and persist questions | Question bank entries |

Everything else (skill gap, roadmap, progress) is **pure backend logic**.

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 20+
- Docker & Docker Compose
- Groq API key (for AI features)

### 1. Start Infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d postgres redis
```

### 2. Start Backend

```bash
cd backend
export GROQ_API_KEY=your-key-here
export JWT_SECRET=at-least-32-random-bytes
mvn spring-boot:run
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

### Full Docker Deployment

```bash
# Set required secrets
export GROQ_API_KEY=your-key-here
export JWT_SECRET=at-least-32-random-bytes

# Build and start everything
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

## 📦 Modules

| Module | Description | AI? |
|--------|-------------|-----|
| **Authentication** | JWT auth with refresh tokens | ❌ |
| **Resume Analyzer** | Upload + AI parse | ✅ |
| **JD Matcher** | Paste/upload JD + AI parse | ✅ |
| **Skill Gap** | Compare resume vs JD skills | ❌ Pure logic |
| **DSA Roadmap** | Generate personalized study plan | ❌ Pure logic |
| **Mock Interview** | AI-generated role-specific questions | ✅ |
| **Progress Dashboard** | Track study progress | ❌ |
| **Notifications** | Event-driven notifications | ❌ |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Zustand, Axios |
| Backend | Spring Boot 3.4, Java 17, Spring Security 6 |
| AI | Spring AI + Groq |
| Database | PostgreSQL 16 + Flyway |
| Cache | Redis 7 |
| Auth | JWT (jjwt) + BCrypt |
| DevOps | Docker, GitHub Actions CI/CD |

## 📁 Project Structure

```
interview-prep-platform/
├── backend/
│   └── src/main/java/com/interviewprep/
│       ├── auth/          # JWT Authentication
│       ├── resume/        # Resume Analyzer (AI)
│       ├── jobdesc/       # JD Matcher (AI)
│       ├── skillgap/      # Skill Gap Analysis
│       ├── roadmap/       # DSA Roadmap Generator
│       ├── interview/     # Mock Interview (AI)
│       ├── progress/      # Progress Dashboard
│       ├── notification/  # Notification Service
│       ├── config/        # Security, Redis, AI
│       └── common/        # Shared exceptions, utils
├── frontend/
│   └── src/
│       ├── pages/         # All page components
│       ├── components/    # Layout, UI components
│       ├── services/      # API layer with JWT interceptor
│       ├── store/         # Zustand auth store
│       └── types/         # TypeScript interfaces
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 🧪 Testing

```bash
# Backend tests
cd backend && mvn test

# Frontend build check
cd frontend && npm run build
```

## 📝 Concepts Demonstrated

- ✅ Microservice-ready modular design
- ✅ Redis caching with named caches
- ✅ Async processing (@Async)
- ✅ AI integration (Spring AI structured output)
- ✅ REST APIs with proper DTOs
- ✅ Spring Security 6 + JWT
- ✅ Docker deployment
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Database migrations (Flyway)
- ✅ Global exception handling
- ✅ CORS configuration

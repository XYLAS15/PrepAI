// ===========================
// API Types — mirrors backend DTOs
// ===========================

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface ResumeResponse {
  id: string;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  parsedData: Record<string, any> | null;
  createdAt: string;
}

export interface JobDescriptionResponse {
  id: string;
  title: string;
  company: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  parsedData: Record<string, any> | null;
  createdAt: string;
}

export interface SkillGapResponse {
  id: string;
  resumeId: string;
  jobDescId: string;
  matchingSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  matchScore: number;
  createdAt: string;
}

export interface RoadmapTopic {
  order: number;
  name: string;
  category: string;
  difficulty: string;
  subtopics: string[];
  prerequisites: string[];
  estimatedHours: number;
  resources: string[];
  priority: number;
}

export interface RoadmapResponse {
  id: string;
  analysisId: string;
  topics: RoadmapTopic[];
  difficulty: string;
  estimatedWeeks: number;
  createdAt: string;
}

export interface InterviewQuestionData {
  question: string;
  difficulty: string;
  category: string;
  hints: string[];
  expectedTopics: string[];
  sampleAnswer: string;
}

export interface InterviewResponseData {
  id: string;
  jobDescId: string;
  interviewType: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  questions: InterviewQuestionData[];
  createdAt: string;
}

export interface DashboardStats {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  completionPercentage: number;
  resumesAnalyzed: number;
  jobsMatched: number;
  interviewsTaken: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}


import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ===========================
// Auth API
// ===========================

export const authApi = {
  register: (fullName: string, email: string, password: string) =>
    api.post('/auth/register', { fullName, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};

// ===========================
// Resume API
// ===========================

export const resumeApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/resumes'),
  getById: (id: string) => api.get(`/resumes/${id}`),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};

// ===========================
// Job Description API
// ===========================

export const jobDescApi = {
  create: (title: string, company: string, rawText: string) =>
    api.post('/job-descriptions', { title, company, rawText }),
  getAll: () => api.get('/job-descriptions'),
  getById: (id: string) => api.get(`/job-descriptions/${id}`),
  delete: (id: string) => api.delete(`/job-descriptions/${id}`),
};

// ===========================
// Skill Gap API
// ===========================

export const skillGapApi = {
  analyze: (resumeId: string, jobDescId: string) =>
    api.post('/skill-gap/analyze', { resumeId, jobDescId }),
  getAll: () => api.get('/skill-gap'),
  getById: (id: string) => api.get(`/skill-gap/${id}`),
};

// ===========================
// Roadmap API
// ===========================

export const roadmapApi = {
  generate: (analysisId: string) =>
    api.post(`/roadmaps/generate?analysisId=${analysisId}`),
  getAll: () => api.get('/roadmaps'),
  getById: (id: string) => api.get(`/roadmaps/${id}`),
};

// ===========================
// Interview API
// ===========================

export const interviewApi = {
  generate: (jobDescId: string, interviewType: string = 'TECHNICAL') =>
    api.post('/interviews/generate', { jobDescId, interviewType }),
  getAll: () => api.get('/interviews'),
  getById: (id: string) => api.get(`/interviews/${id}`),
  submitAnswer: (id: string, questionIndex: number, userAnswer: string, score: number, timeSpentSec: number) =>
    api.post(`/interviews/${id}/respond`, { questionIndex, userAnswer, score, timeSpentSec }),
};

// ===========================
// Progress API
// ===========================

export const progressApi = {
  getDashboard: () => api.get('/progress/dashboard'),
  getAll: () => api.get('/progress'),
  getRoadmapProgress: (roadmapId: string) => api.get(`/progress/roadmap/${roadmapId}`),
  update: (id: string, status: string, notes?: string) =>
    api.put(`/progress/${id}`, { status, notes }),
};

// ===========================
// Notifications API
// ===========================

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// ===========================
// Question Bank API
// ===========================

export interface QuestionBankDto {
  id: string;
  category: string;
  difficulty: string;
  title: string;
  description: string;
  hints: string[];
  tags: string[];
  leetcodeUrl?: string;
}

export const questionBankApi = {
  getAll: () => api.get<QuestionBankDto[]>('/question-bank'),
  saveBulk: (questions: QuestionBankDto[]) => api.post<QuestionBankDto[]>('/question-bank/bulk', questions),
};

export interface AnswerFeedback {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  keyMissing: string[];
}

export interface ATSResult {
  overallScore: number;
  keywordScore: number;
  formatScore: number;
  relevanceScore: number;
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: Array<{ priority: 'High' | 'Medium' | 'Low'; section: string; suggestion: string }>;
  sectionFeedback: Record<string, string>;
  verdict: string;
}

export const assistantApi = {
  getAnswerFeedback: (question: string, category: string, difficulty: string, userAnswer: string) =>
    api.post<AnswerFeedback>('/assistant/answer-feedback', { question, category, difficulty, userAnswer }),
  scoreResumeATS: (resumeId: string, jobDescId: string) =>
    api.post<ATSResult>('/assistant/ats-score', { resumeId, jobDescId }),
  generateQuestions: (category: string) =>
    api.post<QuestionBankDto[]>('/assistant/questions', { category }),
};

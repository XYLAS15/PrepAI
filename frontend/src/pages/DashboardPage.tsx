import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Briefcase, GitCompare, MessageSquare,
  TrendingUp, Route, ArrowRight, Flame, Trophy, Target,
  BookOpen, Star, Zap
} from 'lucide-react';
import { progressApi } from '../services/api';
import { DashboardStats } from '../types';
import { useStreakStore } from '../store/streakStore';
import { useAuthStore } from '../store/authStore';

const ACHIEVEMENTS = [
  { id: 'first_day', icon: '🌟', title: 'First Step', desc: 'Started your prep journey' },
  { id: 'first_answer', icon: '✍️', title: 'First Answer', desc: 'Submitted your first answer' },
  { id: 'streak_3', icon: '🔥', title: '3-Day Streak', desc: 'Practiced 3 days in a row' },
  { id: 'streak_7', icon: '⚡', title: 'Week Warrior', desc: 'Practiced 7 days in a row' },
  { id: 'daily_goal', icon: '🎯', title: 'Goal Crusher', desc: 'Completed your daily goal' },
  { id: 'ten_answers', icon: '💪', title: 'Consistent', desc: 'Answered 10 questions in a day' },
  { id: 'streak_30', icon: '👑', title: 'Unstoppable', desc: '30-day streak achieved' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { streak, todayCompleted, dailyGoal, achievements, checkAndUpdateStreak } = useStreakStore();

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await progressApi.getDashboard();
        setStats(data);
      } catch {
        setStats({
          totalTopics: 0, completedTopics: 0, inProgressTopics: 0,
          completionPercentage: 0, resumesAnalyzed: 0,
          jobsMatched: 0, interviewsTaken: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Resumes Analyzed', value: stats?.resumesAnalyzed || 0, color: 'blue', icon: FileText },
    { label: 'Jobs Matched', value: stats?.jobsMatched || 0, color: 'purple', icon: Briefcase },
    { label: 'Interviews Taken', value: stats?.interviewsTaken || 0, color: 'cyan', icon: MessageSquare },
    { label: 'DSA Completion', value: `${stats?.completionPercentage || 0}%`, color: 'green', icon: TrendingUp },
  ];

  const quickActions = [
    { label: 'Upload Resume', desc: 'Parse your resume with AI', icon: FileText, path: '/resumes', color: 'var(--accent-blue)' },
    { label: 'Add Job Description', desc: 'Analyze a target role', icon: Briefcase, path: '/job-descriptions', color: 'var(--accent-purple)' },
    { label: 'Skill Gap Analysis', desc: 'Compare resume vs JD', icon: GitCompare, path: '/skill-gap', color: 'var(--accent-emerald)' },
    { label: 'DSA Roadmap', desc: 'Get your study plan', icon: Route, path: '/roadmap', color: 'var(--accent-amber)' },
    { label: 'Mock Interview', desc: 'Practice with AI questions', icon: MessageSquare, path: '/interviews', color: 'var(--accent-cyan)' },
    { label: 'Question Bank', desc: '25+ curated questions', icon: BookOpen, path: '/question-bank', color: 'var(--accent-rose)' },
  ];

  const goalPct = Math.min(100, Math.round((todayCompleted / dailyGoal) * 100));
  const earnedBadges = ACHIEVEMENTS.filter(a => achievements.includes(a.id));

  return (
    <div className="page-container">
      {/* Hero Welcome Section */}
      <div className="dashboard-hero animate-fade-in-up">
        <div className="hero-content">
          <div className="hero-greeting">
            <span className="hero-wave">👋</span>
            <div>
              <h1 className="hero-name">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Developer'}
              </h1>
              <p className="hero-subtitle">Ready to crush your interviews today?</p>
            </div>
          </div>
          <div className="hero-streak">
            <div className="streak-badge">
              <Flame className="streak-flame" size={28} />
              <div>
                <div className="streak-number">{streak}</div>
                <div className="streak-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="daily-goal-bar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
              <Target size={14} />
              Today's Goal: {todayCompleted}/{dailyGoal} questions
            </div>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: goalPct >= 100 ? 'var(--accent-emerald)' : 'var(--accent-blue)' }}>
              {goalPct >= 100 ? '🎉 Goal Complete!' : `${goalPct}%`}
            </span>
          </div>
          <div className="progress-bar-container" style={{ height: '8px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${goalPct}%`,
                background: goalPct >= 100 ? 'var(--gradient-success)' : 'var(--gradient-primary)',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {statCards.map((stat, i) => (
          <div
            className={`stat-card ${stat.color} animate-fade-in-up`}
            key={i}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="stat-icon">
              <stat.icon size={22} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* DSA Progress */}
      {(stats?.totalTopics || 0) > 0 && (
        <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-8)', animationDelay: '0.3s' }}>
          <div className="card-header">
            <div>
              <div className="card-title">DSA Roadmap Progress</div>
              <div className="card-subtitle">
                {stats?.completedTopics} of {stats?.totalTopics} topics completed
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="badge badge-green">{stats?.completionPercentage}%</span>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/roadmap')}>
                View Roadmap <ArrowRight size={14} />
              </button>
            </div>
          </div>
          <div className="progress-bar-container" style={{ height: '10px' }}>
            <div
              className="progress-bar-fill green"
              style={{ width: `${stats?.completionPercentage || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-8)', animationDelay: '0.4s' }}>
        <div className="card-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Trophy size={20} style={{ color: 'var(--accent-amber)' }} />
            Achievements
          </div>
          <span className="badge badge-amber">{earnedBadges.length}/{ACHIEVEMENTS.length} Unlocked</span>
        </div>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((a) => {
            const earned = achievements.includes(a.id);
            return (
              <div key={a.id} className={`achievement-badge ${earned ? 'earned' : 'locked'}`}>
                <span className="achievement-icon">{earned ? a.icon : '🔒'}</span>
                <div className="achievement-info">
                  <div className="achievement-title">{a.title}</div>
                  <div className="achievement-desc">{a.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Zap size={20} style={{ color: 'var(--accent-blue)' }} />
          <div className="card-title">Quick Actions</div>
        </div>
        <div className="grid-3">
          {quickActions.map((action, i) => (
            <div
              key={i}
              className="quick-action-card animate-fade-in-up"
              style={{ animationDelay: `${0.5 + i * 0.07}s` }}
              onClick={() => navigate(action.path)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: `${action.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: action.color, marginBottom: 'var(--space-4)',
                }}>
                  <action.icon size={22} />
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                {action.label}
              </h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

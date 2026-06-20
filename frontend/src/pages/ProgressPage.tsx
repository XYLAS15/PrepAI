import { useEffect, useState } from 'react';
import { TrendingUp, FileText, Briefcase, MessageSquare, BookOpen } from 'lucide-react';
import { progressApi } from '../services/api';
import { DashboardStats } from '../types';

export default function ProgressPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading-overlay"><div className="spinner" /></div></div>;
  }

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return 'green';
    if (pct >= 40) return 'amber';
    return 'rose';
  };

  const milestones = [
    { label: 'Upload Resume', done: (stats?.resumesAnalyzed || 0) > 0, icon: FileText },
    { label: 'Add Job Description', done: (stats?.jobsMatched || 0) > 0, icon: Briefcase },
    { label: 'Run Skill Analysis', done: (stats?.totalTopics || 0) > 0, icon: TrendingUp },
    { label: 'Generate Roadmap', done: (stats?.totalTopics || 0) > 0, icon: BookOpen },
    { label: 'Take Mock Interview', done: (stats?.interviewsTaken || 0) > 0, icon: MessageSquare },
    { label: 'Complete 50% Topics', done: (stats?.completionPercentage || 0) >= 50, icon: TrendingUp },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Progress Tracker</h1>
        <p>Monitor your interview preparation journey</p>
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
        <div className="gauge-container">
          <svg className="gauge-svg" width="160" height="160" viewBox="0 0 160 160">
            <circle className="gauge-bg" cx="80" cy="80" r="70" />
            <circle className="gauge-fill" cx="80" cy="80" r="70"
              stroke={`var(--accent-${getProgressColor(stats?.completionPercentage || 0)})`}
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - (stats?.completionPercentage || 0) / 100)}`}
            />
          </svg>
          <div className="gauge-value">
            <div className="number">{Math.round(stats?.completionPercentage || 0)}</div>
            <div className="unit">% Complete</div>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
          {stats?.completedTopics || 0} of {stats?.totalTopics || 0} DSA topics completed
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card blue">
          <div className="stat-icon"><FileText size={22} /></div>
          <div className="stat-value">{stats?.resumesAnalyzed || 0}</div>
          <div className="stat-label">Resumes Analyzed</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><Briefcase size={22} /></div>
          <div className="stat-value">{stats?.jobsMatched || 0}</div>
          <div className="stat-label">Jobs Matched</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon"><MessageSquare size={22} /></div>
          <div className="stat-value">{stats?.interviewsTaken || 0}</div>
          <div className="stat-label">Interviews Taken</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><TrendingUp size={22} /></div>
          <div className="stat-value">{stats?.inProgressTopics || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      {/* Milestones */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Journey Milestones</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {milestones.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              background: m.done ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${m.done ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-primary)'}`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                background: m.done ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: m.done ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontSize: 'var(--font-sm)', fontWeight: 700,
              }}>
                {m.done ? '✓' : i + 1}
              </div>
              <span style={{
                fontWeight: 500,
                color: m.done ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                textDecoration: m.done ? 'line-through' : 'none',
              }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

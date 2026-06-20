import { useEffect, useState } from 'react';
import {
  FileText, Briefcase, Zap, CheckCircle2, XCircle,
  AlertTriangle, TrendingUp, Star, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { assistantApi, ATSResult, resumeApi, jobDescApi } from '../services/api';
import { ResumeResponse, JobDescriptionResponse } from '../types';

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="ats-score-ring">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="ats-ring-center">
        <div className="ats-ring-score" style={{ color }}>{score}</div>
        <div className="ats-ring-label">{label}</div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = (priority || '').toLowerCase();
  const map: Record<string, string> = { high: 'badge-rose', medium: 'badge-amber', low: 'badge-green' };
  return <span className={`badge ${map[p] || 'badge-blue'}`}>{priority}</span>;
}

export default function ATSScorePage() {
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [jobDescs, setJobDescs] = useState<JobDescriptionResponse[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJD, setSelectedJD] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'suggestions' | 'sections'>('overview');

  useEffect(() => {
    Promise.all([resumeApi.getAll(), jobDescApi.getAll()]).then(([r, j]) => {
      setResumes(r.data.filter((r: ResumeResponse) => r.status === 'COMPLETED'));
      setJobDescs(j.data.filter((j: JobDescriptionResponse) => j.status === 'COMPLETED'));
    });
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResume || !selectedJD) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await assistantApi.scoreResumeATS(selectedResume, selectedJD);
      setResult(data);
      setActiveTab('overview');
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const scoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ATS Score Analyzer</h1>
        <p>Check how well your resume matches a job description against ATS systems</p>
      </div>

      {/* Selector Card */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>
          Select Resume & Job Description
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <FileText size={14} /> Resume
            </label>
            <select className="form-input" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
              <option value="">Select a resume...</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.fileName}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Briefcase size={14} /> Job Description
            </label>
            <select className="form-input" value={selectedJD} onChange={e => setSelectedJD(e.target.value)}>
              <option value="">Select a JD...</option>
              {jobDescs.map(j => (
                <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            disabled={!selectedResume || !selectedJD || loading}
            onClick={handleAnalyze}
            style={{ minWidth: 160 }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</>
            ) : (
              <><Zap size={18} /> Analyze ATS Score</>
            )}
          </button>
        </div>

        {resumes.length === 0 && (
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)', color: 'var(--accent-amber)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <AlertTriangle size={14} /> No completed resumes found. Upload and process a resume first.
          </div>
        )}

        {error && (
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)', color: 'var(--accent-rose)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <XCircle size={14} /> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="animate-fade-in-up">
          {/* Score Overview */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
              {/* Main Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                <ScoreRing score={result.overallScore} label="ATS Score" color={scoreColor(result.overallScore)} />
                <div>
                  <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: scoreColor(result.overallScore) }}>
                    {scoreLabel(result.overallScore)}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', maxWidth: 300, marginTop: 'var(--space-2)', lineHeight: 1.6 }}>
                    {result.verdict}
                  </div>
                </div>
              </div>

              {/* Sub Scores */}
              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                {[
                  { label: 'Keywords', score: result.keywordScore },
                  { label: 'Format', score: result.formatScore },
                  { label: 'Relevance', score: result.relevanceScore },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: scoreColor(s.score) }}>{s.score}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
                    <div className="progress-bar-container" style={{ width: 80, height: 5, marginTop: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${s.score}%`, background: scoreColor(s.score) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-primary)', paddingBottom: 'var(--space-3)' }}>
            {(['overview', 'keywords', 'suggestions', 'sections'] as const).map(tab => (
              <button
                key={tab}
                className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: 'capitalize' }}
              >{tab}</button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-title" style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <CheckCircle2 size={18} /> What's Working
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {result.presentKeywords.slice(0, 8).map((kw, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} /> {kw}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <XCircle size={18} /> Critical Gaps
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {result.missingKeywords.slice(0, 8).map((kw, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      <XCircle size={14} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} /> {kw}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Keywords */}
          {activeTab === 'keywords' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
                  ✅ Present Keywords ({result.presentKeywords.length})
                </div>
                <div className="skill-tags">
                  {result.presentKeywords.map((kw, i) => (
                    <span key={i} className="skill-tag matching">{kw}</span>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
                  ❌ Missing Keywords ({result.missingKeywords.length})
                </div>
                <div className="skill-tags">
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="skill-tag missing">{kw}</span>
                  ))}
                </div>
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(255,0,0,0.05)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', display: 'flex', gap: 'var(--space-2)' }}>
                  <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  Add these keywords naturally in your experience bullets, skills section, or summary to improve your ATS score.
                </div>
              </div>
            </div>
          )}

          {/* Tab: Suggestions */}
          {activeTab === 'suggestions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {result.suggestions.map((s, i) => (
                <div key={i} className="card" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    {s.priority === 'High' ? <AlertTriangle size={18} style={{ color: 'var(--accent-rose)' }} /> :
                      s.priority === 'Medium' ? <TrendingUp size={18} style={{ color: 'var(--accent-amber)' }} /> :
                        <Star size={18} style={{ color: 'var(--accent-emerald)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <PriorityBadge priority={s.priority} />
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.section}</span>
                    </div>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Section Feedback */}
          {activeTab === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {Object.entries(result.sectionFeedback).map(([section, feedback]) => (
                <div key={section} className="card">
                  <button
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}
                    onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                  >
                    <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)', fontSize: 'var(--font-md)' }}>
                      {section === 'summary' ? '📋' : section === 'experience' ? '💼' : section === 'skills' ? '⚡' : section === 'education' ? '🎓' : '🚀'} {section}
                    </span>
                    {expandedSection === section ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  {expandedSection === section && (
                    <p style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-primary)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>ATS Analysis Ready</h3>
          <p>Select a resume and job description above to get your ATS compatibility score, keyword gap analysis, and specific improvement suggestions.</p>
        </div>
      )}
    </div>
  );
}

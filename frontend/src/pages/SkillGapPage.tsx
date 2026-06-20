import { useEffect, useState } from 'react';
import { GitCompare, ArrowRight } from 'lucide-react';
import { skillGapApi, resumeApi, jobDescApi } from '../services/api';
import { SkillGapResponse, ResumeResponse, JobDescriptionResponse } from '../types';

export default function SkillGapPage() {
  const [analyses, setAnalyses] = useState<SkillGapResponse[]>([]);
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [jobDescs, setJobDescs] = useState<JobDescriptionResponse[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJD, setSelectedJD] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<SkillGapResponse | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [a, r, j] = await Promise.all([
          skillGapApi.getAll(), resumeApi.getAll(), jobDescApi.getAll()
        ]);
        setAnalyses(a.data);
        setResumes(r.data.filter((r: ResumeResponse) => r.status === 'COMPLETED'));
        setJobDescs(j.data.filter((j: JobDescriptionResponse) => j.status === 'COMPLETED'));
        if (a.data.length > 0) setActiveAnalysis(a.data[0]);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResume || !selectedJD) return;
    setAnalyzing(true);
    try {
      const { data } = await skillGapApi.analyze(selectedResume, selectedJD);
      setActiveAnalysis(data);
      setAnalyses(prev => [data, ...prev.filter(a => a.id !== data.id)]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  if (loading) {
    return <div className="page-container"><div className="loading-overlay"><div className="spinner" /></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Skill Gap Analysis</h1>
        <p>Compare your resume against job requirements — pure logic, no AI</p>
      </div>

      {/* Analysis Form */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
          <GitCompare size={20} style={{ display: 'inline', marginRight: 8 }} />
          Run Analysis
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <label className="form-label">Resume</label>
            <select className="form-input" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
              <option value="">Select a resume...</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.fileName}</option>)}
            </select>
          </div>
          <ArrowRight size={20} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
          <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <label className="form-label">Job Description</label>
            <select className="form-input" value={selectedJD} onChange={e => setSelectedJD(e.target.value)}>
              <option value="">Select a job description...</option>
              {jobDescs.map(j => <option key={j.id} value={j.id}>{j.title || 'Untitled'} — {j.company || '?'}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAnalyze}
            disabled={!selectedResume || !selectedJD || analyzing}
            style={{ marginBottom: 0 }}>
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Results */}
      {activeAnalysis && (
        <div className="animate-fade-in-up">
          {/* Score Gauge */}
          <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div className="gauge-container">
              <svg className="gauge-svg" width="160" height="160" viewBox="0 0 160 160">
                <circle className="gauge-bg" cx="80" cy="80" r="70" />
                <circle className="gauge-fill" cx="80" cy="80" r="70"
                  stroke={getScoreColor(activeAnalysis.matchScore)}
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - activeAnalysis.matchScore / 100)}`}
                />
              </svg>
              <div className="gauge-value">
                <div className="number" style={{ color: getScoreColor(activeAnalysis.matchScore) }}>
                  {Math.round(activeAnalysis.matchScore)}
                </div>
                <div className="unit">% Match</div>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid-3">
            <div className="card">
              <div className="card-title" style={{ color: 'var(--accent-emerald)', marginBottom: 'var(--space-3)' }}>
                ✅ Matching ({activeAnalysis.matchingSkills.length})
              </div>
              <div className="skill-tags">
                {activeAnalysis.matchingSkills.map((s, i) => (
                  <span key={i} className="skill-tag matching">{s}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ color: 'var(--accent-rose)', marginBottom: 'var(--space-3)' }}>
                ❌ Missing ({activeAnalysis.missingSkills.length})
              </div>
              <div className="skill-tags">
                {activeAnalysis.missingSkills.map((s, i) => (
                  <span key={i} className="skill-tag missing">{s}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ color: 'var(--accent-purple)', marginBottom: 'var(--space-3)' }}>
                ➕ Extra ({activeAnalysis.extraSkills.length})
              </div>
              <div className="skill-tags">
                {activeAnalysis.extraSkills.map((s, i) => (
                  <span key={i} className="skill-tag extra">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

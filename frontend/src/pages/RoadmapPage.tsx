import { useEffect, useState } from 'react';
import { Route, Clock, BookOpen, CheckCircle, Edit } from 'lucide-react';
import { roadmapApi, skillGapApi } from '../services/api';
import { getDsaQuestionLink } from '../services/dsaLinks';
import { RoadmapResponse, SkillGapResponse } from '../types';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<RoadmapResponse[]>([]);
  const [analyses, setAnalyses] = useState<SkillGapResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapResponse | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!activeRoadmap) return;
    const loadedNotes: Record<string, string> = {};
    activeRoadmap.topics.forEach((topic: any) => {
      const key = `roadmap-notes:${activeRoadmap.id}:${topic.name}`;
      const val = localStorage.getItem(key);
      if (val) loadedNotes[topic.name] = val;
    });
    setNotes(loadedNotes);
  }, [activeRoadmap?.id]);

  const handleNoteChange = (topicName: string, val: string) => {
    if (!activeRoadmap) return;
    setNotes(prev => ({ ...prev, [topicName]: val }));
    const key = `roadmap-notes:${activeRoadmap.id}:${topicName}`;
    localStorage.setItem(key, val);
  };

  const toggleNotes = (idx: number) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, a] = await Promise.all([roadmapApi.getAll(), skillGapApi.getAll()]);
        setRoadmaps(r.data);
        setAnalyses(a.data);
        if (r.data.length > 0) setActiveRoadmap(r.data[0]);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedAnalysis) return;
    setGenerating(true);
    try {
      const { data } = await roadmapApi.generate(selectedAnalysis);
      setActiveRoadmap(data);
      setRoadmaps(prev => [data, ...prev]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'EASY': return 'green';
      case 'MEDIUM': return 'amber';
      case 'HARD': return 'rose';
      default: return 'blue';
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-overlay"><div className="spinner" /></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>DSA Roadmap</h1>
        <p>Personalized study plan generated from your skill gap analysis</p>
      </div>

      {/* Generator */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Generate New Roadmap</div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Based on Skill Analysis</label>
            <select className="form-input" value={selectedAnalysis} onChange={e => setSelectedAnalysis(e.target.value)}>
              <option value="">Select an analysis...</option>
              {analyses.map(a => (
                <option key={a.id} value={a.id}>
                  Match: {Math.round(a.matchScore)}% ({a.missingSkills.length} missing skills)
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate}
            disabled={!selectedAnalysis || generating}>
            {generating ? 'Generating...' : 'Generate Roadmap'}
          </button>
        </div>
      </div>

      {/* Roadmap Display */}
      {activeRoadmap && (
        <div className="animate-fade-in-up">
          {/* Summary */}
          <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card blue">
              <div className="stat-icon"><BookOpen size={22} /></div>
              <div className="stat-value">{activeRoadmap.topics.length}</div>
              <div className="stat-label">Topics</div>
            </div>
            <div className="stat-card amber">
              <div className="stat-icon"><Clock size={22} /></div>
              <div className="stat-value">{activeRoadmap.estimatedWeeks}</div>
              <div className="stat-label">Estimated Weeks</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon"><Route size={22} /></div>
              <div className="stat-value">{activeRoadmap.difficulty}</div>
              <div className="stat-label">Difficulty Level</div>
            </div>
          </div>

          {/* Topics Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {activeRoadmap.topics.map((topic: any, i: number) => (
              <div key={i} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div className="question-number">{topic.order}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-lg)', marginBottom: 'var(--space-1)' }}>
                        {topic.name}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                        <span className={`badge badge-${difficultyColor(topic.difficulty)}`}>{topic.difficulty}</span>
                        <span className="badge badge-blue">{topic.category}</span>
                        <span className="badge badge-cyan">{topic.estimatedHours}h</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className={`btn btn-sm ${notes[topic.name] ? 'btn-secondary' : 'btn-ghost'}`} 
                    onClick={() => toggleNotes(i)}
                    title="Topic Notes"
                  >
                    <Edit size={14} />
                    {notes[topic.name] ? 'Notes Saved' : 'Add Notes'}
                  </button>
                </div>

                {topic.subtopics && topic.subtopics.length > 0 && (
                  <div style={{ marginLeft: 48, marginTop: 'var(--space-2)' }}>
                    <div className="form-label">Problems to Solve</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                      {topic.subtopics.map((sub: string, j: number) => (
                        <a
                          key={j}
                          href={getDsaQuestionLink(sub)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dsa-question-link"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--font-sm)',
                            color: 'var(--text-secondary)',
                            padding: 'var(--space-2) 0',
                            transition: 'color var(--transition-fast), transform var(--transition-fast)',
                            textDecoration: 'none',
                          }}
                        >
                          <CheckCircle size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span style={{ borderBottom: '1px dashed var(--text-tertiary)' }}>{sub}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {expandedNotes.has(i) && (
                  <div style={{ marginLeft: 48, marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-3)' }}>
                    <label className="form-label" style={{ fontSize: 'var(--font-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 0 }}>Study Notes & Solutions</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Paste LeetCode solutions, key code snippets, or definitions here... (Auto-saved)"
                      value={notes[topic.name] || ''}
                      onChange={(e) => handleNoteChange(topic.name, e.target.value)}
                      style={{ minHeight: '90px', marginTop: 'var(--space-2)' }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="status-dot completed" style={{ width: '6px', height: '6px' }} /> Auto-saved to browser local storage
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

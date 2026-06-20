import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Bookmark, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, Search, Filter, X, Sparkles, Send } from 'lucide-react';
import { useStreakStore } from '../store/streakStore';
import { assistantApi, AnswerFeedback, questionBankApi, QuestionBankDto } from '../services/api';
import Editor from '@monaco-editor/react';

type Category = 'All' | 'DSA' | 'System Design' | 'Behavioral' | 'JavaScript' | 'Java' | 'Python';
type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

const CATEGORIES: Category[] = ['All', 'DSA', 'System Design', 'Behavioral', 'JavaScript', 'Java', 'Python'];
const DIFFICULTIES: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard'];

const difficultyColor = (d: string) => {
  switch (d) {
    case 'Easy': return 'badge-green';
    case 'Medium': return 'badge-amber';
    case 'Hard': return 'badge-rose';
    default: return 'badge-blue';
  }
};

const categoryColor = (c: string): string => {
  const map: Record<string, string> = {
    DSA: 'badge-blue', 'System Design': 'badge-purple',
    Behavioral: 'badge-cyan', JavaScript: 'badge-amber',
    Java: 'badge-rose', Python: 'badge-green',
  };
  return map[c] || 'badge-blue';
};

export default function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [difficulty, setDifficulty] = useState<Difficulty>('All');
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('prepai_bookmarks') || '[]')); }
    catch { return new Set(); }
  });
  const [practiced, setPracticed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('prepai_practiced') || '[]')); }
    catch { return new Set(); }
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const [questions, setQuestions] = useState<QuestionBankDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [code, setCode] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, AnswerFeedback | 'loading'>>({});

  const incrementTodayCompleted = useStreakStore((s) => s.incrementTodayCompleted);

  useEffect(() => {
    questionBankApi.getAll().then(res => {
      setQuestions(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    if (category === 'All') {
      alert("Please select a specific category (e.g., DSA, Java) to generate questions for.");
      return;
    }
    setGenerating(true);
    try {
      const { data } = await assistantApi.generateQuestions(category);
      setQuestions(prev => [...prev, ...data]);
    } catch(e) {
      console.error(e);
      alert("Failed to generate questions. Check console.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async (q: QuestionBankDto) => {
    const answer = code[q.id!] || '';
    if (!answer.trim()) return;
    
    setFeedback(prev => ({...prev, [q.id!]: 'loading'}));
    try {
      const { data } = await assistantApi.getAnswerFeedback(q.title, q.category, q.difficulty, answer);
      setFeedback(prev => ({...prev, [q.id!]: data}));
    } catch(e) {
      console.error(e);
      alert("Failed to get AI feedback");
      setFeedback(prev => { const next = {...prev}; delete next[q.id!]; return next; });
    }
  };

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchCat = category === 'All' || q.category === category;
      const matchDiff = difficulty === 'All' || q.difficulty === difficulty;
      const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchBookmark = !showBookmarksOnly || bookmarks.has(q.id!);
      return matchCat && matchDiff && matchSearch && matchBookmark;
    });
  }, [category, difficulty, search, showBookmarksOnly, bookmarks, questions]);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('prepai_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  const togglePracticed = (id: string) => {
    setPracticed(prev => {
      const next = new Set(prev);
      const wasPracticed = next.has(id);
      if (wasPracticed) { next.delete(id); }
      else { next.add(id); incrementTodayCompleted(); }
      localStorage.setItem('prepai_practiced', JSON.stringify([...next]));
      return next;
    });
  };

  const stats = {
    total: questions.length,
    practiced: practiced.size,
    bookmarked: bookmarks.size,
    pct: questions.length ? Math.round((practiced.size / questions.length) * 100) : 0,
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '100px 0' }}>Loading Question Bank...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Question Bank</h1>
        <p>Curated library of {stats.total} interview questions — track your practice</p>
      </div>

      {/* Stats Bar */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card blue">
          <div className="stat-icon"><BookOpen size={22} /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{stats.practiced}</div>
          <div className="stat-label">Practiced ({stats.pct}%)</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon"><Bookmark size={22} /></div>
          <div className="stat-value">{stats.bookmarked}</div>
          <div className="stat-label">Bookmarked</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search questions or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCategory(c)}
              >{c}</button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDifficulty(d)}
              >{d}</button>
            ))}
          </div>

          {/* Bookmarks Only */}
          <button
            className={`btn btn-sm ${showBookmarksOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          >
            <Bookmark size={14} />
            Bookmarked
          </button>
        </div>
      </div>

      {/* Results Count & Generate Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
          Showing {filtered.length} of {questions.length} questions
        </div>
        <button 
          className="btn btn-sm btn-primary" 
          onClick={handleGenerate} 
          disabled={generating || category === 'All'}
          title={category === 'All' ? 'Select a category first' : 'Generate 5 new AI questions for this category'}
        >
          {generating ? 'Generating...' : <><Sparkles size={14}/> Generate More {category !== 'All' ? category : ''} Questions</>}
        </button>
      </div>

      {/* Question List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No questions match your filters</h3>
            <p>Try adjusting your search or category filters</p>
          </div>
        ) : (
          filtered.map((q, i) => (
            <div
              key={q.id}
              className={`question-bank-card animate-fade-in-up ${practiced.has(q.id) ? 'practiced' : ''}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                {/* Practiced Check */}
                <button
                  className={`practiced-btn ${practiced.has(q.id) ? 'active' : ''}`}
                  onClick={() => togglePracticed(q.id)}
                  title={practiced.has(q.id) ? 'Mark as not practiced' : 'Mark as practiced'}
                >
                  <CheckCircle2 size={20} />
                </button>

                {/* Title & Meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-md)', color: practiced.has(q.id) ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: practiced.has(q.id) ? 'line-through' : 'none' }}>
                      {q.title}
                    </span>
                    <span className={`badge ${difficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                    <span className={`badge ${categoryColor(q.category)}`}>{q.category}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {q.tags.map(tag => (
                      <span key={tag} className="skill-tag" style={{ fontSize: '10px' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  {q.leetcodeUrl && (
                    <a
                      href={q.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                      title="Open on LeetCode"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    className={`btn btn-sm btn-ghost bookmark-btn ${bookmarks.has(q.id) ? 'bookmarked' : ''}`}
                    onClick={() => toggleBookmark(q.id)}
                    title={bookmarks.has(q.id) ? 'Remove bookmark' : 'Bookmark'}
                  >
                    <Bookmark size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                  >
                    {expandedId === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === q.id && (
                <div className="qb-expanded animate-fade-in">
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
                    {q.description}
                  </p>
                  
                  {q.hints && q.hints.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        💡 Hints
                      </div>
                      <ul className="hints-list">
                        {q.hints.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Practice Now / Code Editor Area */}
                  <div style={{ background: 'var(--surface-sunken)', padding: 'var(--space-4)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Sparkles size={16} style={{ color: 'var(--primary)' }}/>
                        Practice Now
                      </div>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSubmitAnswer(q)}
                        disabled={!code[q.id!] || feedback[q.id!] === 'loading'}
                      >
                        {feedback[q.id!] === 'loading' ? 'Evaluating...' : <><Send size={14}/> Submit for AI Feedback</>}
                      </button>
                    </div>

                    {q.category !== 'Behavioral' ? (
                      <div style={{ height: '250px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <Editor
                          height="100%"
                          defaultLanguage={q.category === 'Python' ? 'python' : q.category === 'Java' ? 'java' : 'javascript'}
                          theme="vs-dark"
                          value={code[q.id!] || '// Write your solution code here...'}
                          onChange={(val) => setCode(prev => ({...prev, [q.id!]: val || ''}))}
                          options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
                        />
                      </div>
                    ) : (
                      <textarea
                        className="form-input"
                        style={{ height: '150px', resize: 'vertical' }}
                        placeholder="Type your STAR method answer here..."
                        value={code[q.id!] || ''}
                        onChange={(e) => setCode(prev => ({...prev, [q.id!]: e.target.value}))}
                      />
                    )}

                    {/* AI Feedback Display */}
                    {feedback[q.id!] && feedback[q.id!] !== 'loading' && (
                      <div className="animate-fade-in" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                          <span className={`badge ${(feedback[q.id!] as AnswerFeedback).score >= 8 ? 'badge-green' : (feedback[q.id!] as AnswerFeedback).score >= 5 ? 'badge-amber' : 'badge-rose'}`} style={{ fontSize: '14px', padding: '4px 10px' }}>
                            Score: {(feedback[q.id!] as AnswerFeedback).score}/10
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{(feedback[q.id!] as AnswerFeedback).verdict}</span>
                        </div>
                        
                        <div className="grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>Strengths:</strong>
                            <ul style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', paddingLeft: 'var(--space-4)', marginTop: 'var(--space-1)' }}>
                              {(feedback[q.id!] as AnswerFeedback).strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>Improvements:</strong>
                            <ul style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', paddingLeft: 'var(--space-4)', marginTop: 'var(--space-1)' }}>
                              {(feedback[q.id!] as AnswerFeedback).improvements.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        </div>

                        {(feedback[q.id!] as AnswerFeedback).modelAnswer && (
                          <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface-sunken)', borderRadius: '4px' }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--font-sm)', display: 'block', marginBottom: 'var(--space-2)' }}>Model AI Answer:</strong>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', margin: 0, lineHeight: 1.6 }}>{(feedback[q.id!] as AnswerFeedback).modelAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {q.leetcodeUrl && (
                    <a href={q.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
                      <ExternalLink size={14} /> Open on LeetCode
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

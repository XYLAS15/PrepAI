import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare, Lightbulb, ChevronDown, ChevronUp, Plus, Timer, Clock, Trophy, Play, Pause, Mic, MicOff, Sparkles, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle } from 'lucide-react';
import { assistantApi, AnswerFeedback, interviewApi, jobDescApi } from '../services/api';
import { InterviewResponseData, JobDescriptionResponse } from '../types';
import { useStreakStore } from '../store/streakStore';


const TIME_OPTIONS = [
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: 'Unlimited', value: 0 },
];

function CountdownTimer({ seconds, onExpire, paused }: { seconds: number; onExpire: () => void; paused: boolean }) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (paused || seconds === 0) return;
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [paused, seconds, onExpire]);

  const pct = seconds > 0 ? Math.round((remaining / seconds) * 100) : 100;
  const isWarning = pct < 30;
  const isDanger = pct < 10;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (seconds === 0) return null;

  return (
    <div className={`timer-widget ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
      <Clock size={14} />
      <span className="timer-display">{fmt(remaining)}</span>
      <div className="timer-bar-outer">
        <div className="timer-bar-inner" style={{ width: `${pct}%`, background: isDanger ? 'var(--accent-rose)' : isWarning ? 'var(--accent-amber)' : 'var(--accent-emerald)' }} />
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<InterviewResponseData[]>([]);
  const [jobDescs, setJobDescs] = useState<JobDescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedJD, setSelectedJD] = useState('');
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [activeInterview, setActiveInterview] = useState<InterviewResponseData | null>(null);
  const [expandedHints, setExpandedHints] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [timeLimitSec, setTimeLimitSec] = useState(300);
  const [timerKey, setTimerKey] = useState(0);
  const [pausedTimers, setPausedTimers] = useState<Set<number>>(new Set());
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [startTimes, setStartTimes] = useState<Record<number, number>>({});
  // AI Feedback state
  const [aiFeedback, setAiFeedback] = useState<Record<number, AnswerFeedback>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<number, boolean>>({});
  // Voice recording state
  const [isRecording, setIsRecording] = useState<Record<number, boolean>>({});
  const recognitionRefs = useRef<Record<number, any>>({});
  const initialTextRef = useRef<Record<number, string>>({});

  const incrementTodayCompleted = useStreakStore(s => s.incrementTodayCompleted);

  // ── Voice Answer Mode ──────────────────────────────────────────────────
  const startVoiceRecording = (idx: number) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser. Try Chrome, Edge, or Safari.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRefs.current[idx] = recognition;

    const initialText = answers[idx] || '';
    initialTextRef.current[idx] = initialText;

    recognition.onstart = () => {
      setIsRecording(prev => ({ ...prev, [idx]: true }));
      if (!startTimes[idx]) startTimer(idx);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setAnswers(prev => {
        // If there's a final transcript segment, commit it to our permanent initialTextRef
        if (finalTranscript) {
          const base = initialTextRef.current[idx] || '';
          const separator = base && !base.endsWith(' ') && !finalTranscript.startsWith(' ') ? ' ' : '';
          initialTextRef.current[idx] = base + separator + finalTranscript;
        }
        
        // The display is the permanent text + any current interim text
        const currentBase = initialTextRef.current[idx] || '';
        const separator = currentBase && interimTranscript && !currentBase.endsWith(' ') && !interimTranscript.startsWith(' ') ? ' ' : '';
        return {
          ...prev,
          [idx]: currentBase + separator + interimTranscript
        };
      });
    };

    recognition.onend = () => setIsRecording(prev => ({ ...prev, [idx]: false }));
    
    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        alert('Microphone access was denied. Please click the camera/mic icon in your browser URL bar and allow microphone permissions.');
      } else if (e.error !== 'no-speech') {
        // We ignore 'no-speech' as it just means the user was silent for a while
        alert(`Voice recognition error: ${e.error}`);
      }
      setIsRecording(prev => ({ ...prev, [idx]: false }));
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  const stopVoiceRecording = (idx: number) => {
    if (recognitionRefs.current[idx]) {
      recognitionRefs.current[idx].stop();
    }
    setIsRecording(prev => ({ ...prev, [idx]: false }));
  };

  // ── AI Feedback ────────────────────────────────────────────────────────
  const handleGetFeedback = async (idx: number) => {
    if (!activeInterview) return;
    const q = activeInterview.questions[idx];
    const answer = answers[idx] || '';
    setLoadingFeedback(prev => ({ ...prev, [idx]: true }));
    try {
      const { data } = await assistantApi.getAnswerFeedback(q.question, q.category, q.difficulty, answer);
      setAiFeedback(prev => ({ ...prev, [idx]: data }));
    } catch (e: any) {
      alert('AI feedback failed: ' + e.message);
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [idx]: false }));
    }
  };

  const handleAnswerSubmit = async (idx: number) => {
    if (!activeInterview) return;
    const answer = answers[idx] || '';
    const score = scores[idx] || 3;
    const spent = startTimes[idx] ? Math.round((Date.now() - startTimes[idx]) / 1000) : 0;
    setTimeSpent(prev => ({ ...prev, [idx]: spent }));
    setSubmitting(prev => ({ ...prev, [idx]: true }));

    setSubmitting(prev => ({ ...prev, [idx]: true }));
    try {
      await interviewApi.submitAnswer(activeInterview.id, idx, answer, score, spent);
      setSubmitted(prev => ({ ...prev, [idx]: true }));
      incrementTodayCompleted();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(prev => ({ ...prev, [idx]: false }));
    }
  };

  const handleTimerExpire = useCallback((idx: number) => {
    // Auto-submit if answer exists
    if (answers[idx] && !submitted[idx]) {
      handleAnswerSubmit(idx);
    }
  }, [answers, submitted, activeInterview]);

  const startTimer = (idx: number) => {
    setStartTimes(prev => ({ ...prev, [idx]: Date.now() }));
    setPausedTimers(prev => { const n = new Set(prev); n.delete(idx); return n; });
  };

  const togglePause = (idx: number) => {
    setPausedTimers(prev => {
      const n = new Set(prev);
      if (n.has(idx)) { n.delete(idx); setStartTimes(p => ({ ...p, [idx]: Date.now() })); }
      else { n.add(idx); }
      return n;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [i, j] = await Promise.all([interviewApi.getAll(), jobDescApi.getAll()]);
        setInterviews(i.data);
        setJobDescs(j.data.filter((j: JobDescriptionResponse) => j.status === 'COMPLETED'));
        if (i.data.length > 0 && i.data[0].status === 'COMPLETED') {
          setActiveInterview(i.data[0]);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const hasProcessing = interviews.some(i => i.status === 'PROCESSING');
    if (!hasProcessing) return;
    const interval = setInterval(async () => {
      const { data } = await interviewApi.getAll();
      setInterviews(data);
      const completed = data.find((i: InterviewResponseData) => i.status === 'COMPLETED' && !activeInterview);
      if (completed) setActiveInterview(completed);
    }, 3000);
    return () => clearInterval(interval);
  }, [interviews, activeInterview]);

  useEffect(() => {
    setAnswers({});
    setScores({});
    setSubmitted({});
    setTimeSpent({});
    setStartTimes({});
    setPausedTimers(new Set());
    setTimerKey(k => k + 1);
  }, [activeInterview?.id]);

  const handleGenerate = async () => {
    if (!selectedJD) return;
    setGenerating(true);
    try {
      const { data } = await interviewApi.generate(selectedJD, interviewType);
      setInterviews(prev => [data, ...prev]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const toggleHint = (idx: number) => {
    setExpandedHints(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const difficultyColor = (d: string) => {
    switch (d?.toUpperCase()) {
      case 'EASY': return 'green';
      case 'MEDIUM': return 'amber';
      case 'HARD': return 'rose';
      default: return 'blue';
    }
  };

  const completedCount = Object.values(submitted).filter(Boolean).length;
  const totalQuestions = activeInterview?.questions?.length || 0;
  const avgScore = totalQuestions > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.keys(scores).length, 1) * 10) / 10
    : 0;

  if (loading) {
    return <div className="page-container"><div className="loading-overlay"><div className="spinner" /></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mock Interview</h1>
        <p>AI-generated interview questions tailored to your target role</p>
      </div>

      {/* Generator Card */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Generate New Interview</div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 2, minWidth: 200, marginBottom: 0 }}>
            <label className="form-label">Job Description</label>
            <select className="form-input" value={selectedJD} onChange={e => setSelectedJD(e.target.value)}>
              <option value="">Select a JD...</option>
              {jobDescs.map(j => (
                <option key={j.id} value={j.id}>{j.title || 'Untitled'} — {j.company || '?'}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
            <label className="form-label">Interview Type</label>
            <select className="form-input" value={interviewType} onChange={e => setInterviewType(e.target.value)}>
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="SYSTEM_DESIGN">System Design</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Timer size={14} /> Time Per Question
            </label>
            <select className="form-input" value={timeLimitSec} onChange={e => setTimeLimitSec(Number(e.target.value))}>
              {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={!selectedJD || generating}>
            {generating ? 'Generating...' : <><Plus size={18} /> Generate</>}
          </button>
        </div>
      </div>

      {/* Interview Selector */}
      {interviews.length > 0 && (
        <div className="interview-selector-grid">
          {interviews.map((interview, i) => {
            const matchedJD = jobDescs.find(j => j.id === interview.jobDescId);
            const jdLabel = matchedJD ? `${matchedJD.title || 'Untitled'} — ${matchedJD.company || '?'}` : '';
            return (
              <button
                key={interview.id}
                className={`interview-selector-card ${activeInterview?.id === interview.id ? 'active' : ''} ${interview.status !== 'COMPLETED' ? 'processing' : ''}`}
                onClick={() => interview.status === 'COMPLETED' && setActiveInterview(interview)}
                disabled={interview.status !== 'COMPLETED'}
              >
                <div className="interview-selector-top">
                  <MessageSquare size={16} />
                  <span className="interview-selector-type">{interview.interviewType}</span>
                  <span className="interview-selector-num">#{i + 1}</span>
                </div>
                {jdLabel && <div className="interview-selector-jd" title={jdLabel}>{jdLabel}</div>}
                {interview.status === 'PROCESSING' && (
                  <div className="interview-selector-status">
                    <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Generating...
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Session Stats */}
      {activeInterview && totalQuestions > 0 && (
        <div className="interview-session-stats animate-fade-in">
          <div className="session-stat">
            <span className="session-stat-val">{completedCount}/{totalQuestions}</span>
            <span className="session-stat-label">Answered</span>
          </div>
          <div className="session-stat-divider" />
          <div className="session-stat">
            <span className="session-stat-val">{avgScore > 0 ? avgScore : '—'}/5</span>
            <span className="session-stat-label">Avg Score</span>
          </div>
          <div className="session-stat-divider" />
          <div className="session-stat">
            <span className="session-stat-val">{timeLimitSec > 0 ? `${timeLimitSec / 60}m` : '∞'}</span>
            <span className="session-stat-label">Per Question</span>
          </div>
          <div className="session-stat-divider" />
          <div className="session-stat">
            <Trophy size={16} style={{ color: 'var(--accent-amber)' }} />
            <span className="session-stat-val" style={{ color: completedCount === totalQuestions ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
              {completedCount === totalQuestions && totalQuestions > 0 ? '🎉 Done!' : `${Math.round((completedCount / totalQuestions) * 100)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Questions */}
      {activeInterview?.questions && (
        <div className="interview-chat">
          {activeInterview.questions.map((q, i) => {
            const catUpper = q.category?.toUpperCase() || '';
            const isVoiceSuitable = catUpper !== 'DSA' && catUpper !== 'CODING' && catUpper !== 'JAVA' && catUpper !== 'PYTHON' && catUpper !== 'JAVASCRIPT';

            return (
              <div key={i} className={`question-card animate-fade-in-up ${submitted[i] ? 'submitted' : ''}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1 }}>
                  <span className="question-number">{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--font-md)', fontWeight: 500, lineHeight: 1.7 }}>{q.question}</p>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${difficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                      <span className="badge badge-blue">{q.category}</span>
                      {submitted[i] && timeSpent[i] && (
                        <span className="badge badge-cyan">
                          <Clock size={10} /> {Math.floor(timeSpent[i] / 60)}:{(timeSpent[i] % 60).toString().padStart(2, '0')} spent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timer for this question */}
                {!submitted[i] && timeLimitSec > 0 && startTimes[i] && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                    <CountdownTimer
                      key={`${timerKey}-${i}`}
                      seconds={timeLimitSec}
                      paused={pausedTimers.has(i)}
                      onExpire={() => handleTimerExpire(i)}
                    />
                    <button className="btn btn-sm btn-ghost" onClick={() => togglePause(i)}>
                      {pausedTimers.has(i) ? <Play size={12} /> : <Pause size={12} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Hints */}
              {q.hints && q.hints.length > 0 && (
                <div className="hint-toggle" style={{ marginLeft: 40, marginBottom: 'var(--space-2)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleHint(i)}>
                    <Lightbulb size={14} />
                    {expandedHints.has(i) ? 'Hide Hints' : 'Show Hints'}
                    {expandedHints.has(i) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedHints.has(i) && (
                    <ul className="hints-list animate-fade-in">
                      {q.hints.map((hint, j) => <li key={j}>{hint}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {/* Answering Form */}
              <div className="answer-section" style={{ marginLeft: 40 }}>
                {submitted[i] ? (
                  <div className="animate-fade-in">
                    <div className="submitted-response-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <div className="submitted-response-title">✅ Your Response (Self Score: {scores[i]}/5)</div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSubmitted(prev => ({ ...prev, [i]: false }))}>Edit</button>
                      </div>
                      <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: 'var(--font-sm)', lineHeight: 1.7 }}>{answers[i]}</p>
                    </div>

                    {/* AI Feedback Button + Panel */}
                    {!aiFeedback[i] && (
                      <button
                        className="btn btn-sm"
                        style={{ marginTop: 'var(--space-3)', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
                        disabled={loadingFeedback[i]}
                        onClick={() => handleGetFeedback(i)}
                      >
                        {loadingFeedback[i] ? (
                          <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Getting AI Feedback...</>
                        ) : (
                          <><Sparkles size={14} /> Get AI Feedback</>
                        )}
                      </button>
                    )}

                    {aiFeedback[i] && (
                      <div className="ai-feedback-panel animate-fade-in">
                        {/* Score Header */}
                        <div className="ai-feedback-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Sparkles size={18} style={{ color: '#a78bfa' }} />
                            <span style={{ fontWeight: 800, fontSize: 'var(--font-md)' }}>AI Feedback</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className={`ai-score-badge ${aiFeedback[i].score >= 7 ? 'excellent' : aiFeedback[i].score >= 5 ? 'good' : 'poor'}`}>
                              {aiFeedback[i].score}/10
                            </div>
                            <span className={`badge ${aiFeedback[i].verdict === 'Excellent' ? 'badge-green' : aiFeedback[i].verdict === 'Good' ? 'badge-blue' : aiFeedback[i].verdict === 'Needs Work' ? 'badge-amber' : 'badge-rose'}`}>
                              {aiFeedback[i].verdict}
                            </span>
                          </div>
                        </div>

                        <div className="ai-feedback-body">
                          {/* Strengths */}
                          {aiFeedback[i].strengths.length > 0 && (
                            <div className="ai-feedback-section">
                              <div className="ai-feedback-section-title" style={{ color: 'var(--accent-emerald)' }}>
                                <ThumbsUp size={13} /> What you got right
                              </div>
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {aiFeedback[i].strengths.map((s, j) => (
                                  <li key={j} style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={12} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: 2 }} /> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Improvements */}
                          {aiFeedback[i].improvements.length > 0 && (
                            <div className="ai-feedback-section">
                              <div className="ai-feedback-section-title" style={{ color: 'var(--accent-amber)' }}>
                                <ThumbsDown size={13} /> Areas to improve
                              </div>
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {aiFeedback[i].improvements.map((s, j) => (
                                  <li key={j} style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                                    <AlertCircle size={12} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: 2 }} /> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Model Answer */}
                          {aiFeedback[i].modelAnswer && (
                            <div className="ai-feedback-section ai-model-answer">
                              <div className="ai-feedback-section-title" style={{ color: '#a78bfa' }}>
                                <Sparkles size={13} /> Model Answer
                              </div>
                              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                                {aiFeedback[i].modelAnswer}
                              </p>
                            </div>
                          )}
                        </div>

                        <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-3)' }} onClick={() => setAiFeedback(prev => { const n = { ...prev }; delete n[i]; return n; })}>
                          Close Feedback
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Start Timer Button */}
                    {timeLimitSec > 0 && !startTimes[i] && (
                      <button className="start-timer-btn" onClick={() => startTimer(i)}>
                        <div className="start-timer-icon"><Play size={16} /></div>
                        <div className="start-timer-text">
                          <span className="start-timer-title">Start Timer & Answer</span>
                          <span className="start-timer-subtitle">{timeLimitSec / 60} min countdown</span>
                        </div>
                      </button>
                    )}
                    <div className="form-group" style={{ marginBottom: 'var(--space-3)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <label className="form-label" style={{ fontSize: 'var(--font-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 0 }}>Your Answer</label>
                        {/* Voice Record Button */}
                        {isVoiceSuitable && (
                          <button
                            className={`btn btn-sm ${isRecording[i] ? 'voice-recording-active' : 'btn-ghost'}`}
                            onClick={() => isRecording[i] ? stopVoiceRecording(i) : startVoiceRecording(i)}
                            title={isRecording[i] ? 'Stop voice recording' : 'Start voice recording'}
                          >
                            {isRecording[i] ? <><MicOff size={13} /> Stop Recording</> : <><Mic size={13} /> Voice Answer</>}
                          </button>
                        )}
                      </div>
                      {isRecording[i] && (
                        <div className="voice-recording-indicator">
                          <span className="voice-dot" />
                          Recording — speak your answer clearly...
                        </div>
                      )}
                      <textarea
                        className="form-input form-textarea"
                        placeholder={isVoiceSuitable ? "Type your answer or use the 🎙️ Voice Answer button to speak..." : "Type or paste your code solution here..."}
                        value={answers[i] || ''}
                        onChange={(e) => {
                          setAnswers(prev => ({ ...prev, [i]: e.target.value }));
                          if (!startTimes[i]) startTimer(i);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                      <div className="confidence-selector">
                        <span className="form-label" style={{ marginBottom: 0, fontSize: 'var(--font-xs)' }}>Self-Assessment:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              className={`confidence-btn ${scores[i] === score ? `active score-${score}` : ''}`}
                              onClick={() => setScores(prev => ({ ...prev, [i]: score }))}
                              title={`Rate ${score}/5`}
                            >{score}</button>
                          ))}
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={submitting[i] || !answers[i] || !scores[i]}
                        onClick={() => handleAnswerSubmit(i)}
                      >
                        {submitting[i] ? 'Submitting...' : 'Submit Response'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}


      {!activeInterview && interviews.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No mock interviews yet</h3>
          <p>Generate AI-powered interview questions based on your target job description</p>
        </div>
      )}
    </div>
  );
}

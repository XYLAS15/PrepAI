import { useCallback, useEffect, useState } from 'react';
import { Briefcase, Plus, Trash2, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import { jobDescApi } from '../services/api';
import { JobDescriptionResponse } from '../types';

export default function JobDescPage() {
  const [jobDescs, setJobDescs] = useState<JobDescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJDs = useCallback(async () => {
    try {
      const { data } = await jobDescApi.getAll();
      setJobDescs(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJDs(); }, [fetchJDs]);

  useEffect(() => {
    const hasProcessing = jobDescs.some(j => j.status === 'PROCESSING');
    if (!hasProcessing) return;
    const interval = setInterval(fetchJDs, 3000);
    return () => clearInterval(interval);
  }, [jobDescs, fetchJDs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jobDescApi.create(title, company, rawText);
      setTitle(''); setCompany(''); setRawText('');
      setShowForm(false);
      await fetchJDs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job description?')) return;
    await jobDescApi.delete(id);
    setJobDescs(prev => prev.filter(j => j.id !== id));
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      COMPLETED: { color: 'green', icon: CheckCircle },
      PROCESSING: { color: 'blue', icon: Loader },
      FAILED: { color: 'rose', icon: XCircle },
      PENDING: { color: 'amber', icon: Clock },
    };
    const { color, icon: Icon } = config[status] || config.PENDING;
    return (
      <span className={`badge badge-${color}`}>
        <Icon size={14} style={status === 'PROCESSING' ? { animation: 'spin 1s linear infinite' } : {}} />
        &nbsp;{status}
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Job Descriptions</h1>
          <p>Add target job descriptions for AI-powered analysis</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add JD
        </button>
      </div>

      {showForm && (
        <div className="card animate-scale-in" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>New Job Description</div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="jd-title">Job Title</label>
                <input id="jd-title" className="form-input" placeholder="e.g., Senior Software Engineer"
                  value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="jd-company">Company</label>
                <input id="jd-company" className="form-input" placeholder="e.g., Google"
                  value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="jd-text">Job Description Text *</label>
              <textarea id="jd-text" className="form-input form-textarea"
                placeholder="Paste the full job description here..."
                rows={8} value={rawText} onChange={(e) => setRawText(e.target.value)} required
                style={{ minHeight: '200px' }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Analyzing...' : 'Submit & Analyze'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p>Loading...</p></div>
      ) : jobDescs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>No job descriptions yet</h3>
          <p>Add a target job description to start analyzing skill requirements</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Add Your First JD
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {jobDescs.map((jd) => (
            <div key={jd.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Briefcase size={20} style={{ color: 'var(--accent-purple)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-lg)' }}>
                      {jd.title || 'Untitled Position'}
                    </div>
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {jd.company || 'Unknown Company'} • {new Date(jd.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {statusBadge(jd.status)}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(jd.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {jd.status === 'COMPLETED' && jd.parsedData && (
                <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    {jd.parsedData.seniorityLevel && (
                      <span className="badge badge-amber">{jd.parsedData.seniorityLevel as string}</span>
                    )}
                    {jd.parsedData.roleType && (
                      <span className="badge badge-cyan">{jd.parsedData.roleType as string}</span>
                    )}
                  </div>
                  <div>
                    <div className="form-label" style={{ marginBottom: 'var(--space-1)' }}>Required Skills</div>
                    <div className="skill-tags">
                      {(jd.parsedData.requiredSkills as string[] || []).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

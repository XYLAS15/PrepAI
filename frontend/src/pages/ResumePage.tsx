import { useCallback, useEffect, useState } from 'react';
import { Upload, FileText, Trash2, Eye, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import { resumeApi } from '../services/api';
import { ResumeResponse } from '../types';

export default function ResumePage() {
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeResponse | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const { data } = await resumeApi.getAll();
      setResumes(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // Poll for processing resumes
  useEffect(() => {
    const hasProcessing = resumes.some(r => r.status === 'PROCESSING');
    if (!hasProcessing) return;
    const interval = setInterval(fetchResumes, 3000);
    return () => clearInterval(interval);
  }, [resumes, fetchResumes]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await resumeApi.upload(file);
      await fetchResumes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    await resumeApi.delete(id);
    setResumes(prev => prev.filter(r => r.id !== id));
    if (selectedResume?.id === id) setSelectedResume(null);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />;
      case 'PROCESSING': return <Loader size={16} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />;
      case 'FAILED': return <XCircle size={16} style={{ color: 'var(--accent-rose)' }} />;
      default: return <Clock size={16} style={{ color: 'var(--accent-amber)' }} />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Resume Analyzer</h1>
        <p>Upload your resume and let AI extract your skills and experience</p>
      </div>

      {/* Upload Zone */}
      <label
        className={`file-upload-zone ${dragOver ? 'dragover' : ''}`}
        style={{ display: 'block', marginBottom: 'var(--space-8)' }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <div className="upload-icon">
          {uploading ? <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={48} />}
        </div>
        <h3>{uploading ? 'Uploading...' : 'Drop your resume here'}</h3>
        <p>or click to browse • PDF, TXT (max 10MB)</p>
      </label>

      {/* Resume List */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p>Loading resumes...</p></div>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No resumes yet</h3>
          <p>Upload your first resume to get started with AI-powered analysis</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedResume ? '1fr 1fr' : '1fr', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {resumes.map((resume) => (
              <div key={resume.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedResume(resume)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <FileText size={20} style={{ color: 'var(--accent-blue)' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{resume.fileName}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className={`badge badge-${resume.status === 'COMPLETED' ? 'green' : resume.status === 'FAILED' ? 'rose' : 'blue'}`}>
                      {statusIcon(resume.status)} &nbsp;{resume.status}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {resume.status === 'COMPLETED' && resume.parsedData && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <div className="skill-tags">
                      {(resume.parsedData.skills as string[] || []).slice(0, 8).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                      {(resume.parsedData.skills as string[] || []).length > 8 && (
                        <span className="skill-tag" style={{ opacity: 0.6 }}>
                          +{(resume.parsedData.skills as string[]).length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedResume?.status === 'COMPLETED' && selectedResume.parsedData && (
            <div className="card animate-fade-in" style={{ position: 'sticky', top: 'calc(var(--topbar-height) + var(--space-8))' }}>
              <div className="card-header">
                <div className="card-title">Parsed Resume</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedResume(null)}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {selectedResume.parsedData.name && (
                  <div>
                    <div className="form-label">Name</div>
                    <div style={{ fontWeight: 600 }}>{selectedResume.parsedData.name as string}</div>
                  </div>
                )}
                {selectedResume.parsedData.summary && (
                  <div>
                    <div className="form-label">Summary</div>
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {selectedResume.parsedData.summary as string}
                    </div>
                  </div>
                )}
                <div>
                  <div className="form-label">Skills</div>
                  <div className="skill-tags">
                    {(selectedResume.parsedData.skills as string[] || []).map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                {(selectedResume.parsedData.programmingLanguages as string[] || []).length > 0 && (
                  <div>
                    <div className="form-label">Languages</div>
                    <div className="skill-tags">
                      {(selectedResume.parsedData.programmingLanguages as string[]).map((lang, i) => (
                        <span key={i} className="badge badge-purple">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(selectedResume.parsedData.frameworks as string[] || []).length > 0 && (
                  <div>
                    <div className="form-label">Frameworks</div>
                    <div className="skill-tags">
                      {(selectedResume.parsedData.frameworks as string[]).map((fw, i) => (
                        <span key={i} className="badge badge-cyan">{fw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

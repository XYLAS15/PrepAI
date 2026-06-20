import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  ArrowRight, Sparkles, MessageSquare, FileText, BarChart3,
  BookOpen, Route, GitCompare, Shield, Zap, Brain, Star,
  ChevronRight, Play, CheckCircle2, Target, Clock3
} from 'lucide-react';

/* ───── Animated Particle Background ───── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number; }
    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      a: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${p.a})`;
        ctx.fill();
      }
      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="landing-particles" />;
}



/* ───── Main Landing Page ───── */
export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: MessageSquare, title: 'AI Mock Interviews', desc: 'Practice with AI-generated questions tailored to your target role. Get instant feedback and scoring.', color: '#ef4444', path: '/interviews' },
    { icon: BarChart3, title: 'ATS Score Analyzer', desc: 'Scan your resume against job descriptions. Get keyword match scores and optimization tips.', color: '#f59e0b', path: '/ats-score' },
    { icon: FileText, title: 'Smart Resume Parsing', desc: 'AI-powered resume analysis that extracts skills, experience, and qualifications automatically.', color: '#10b981', path: '/resumes' },
    { icon: GitCompare, title: 'Skill Gap Analysis', desc: 'Compare your skills against job requirements. Know exactly what to learn and improve.', color: '#8b5cf6', path: '/skill-gap' },
    { icon: Route, title: 'DSA Roadmap', desc: 'Structured Data Structures & Algorithms study plan with progress tracking and milestones.', color: '#3b82f6', path: '/roadmap' },
    { icon: BookOpen, title: 'Question Bank', desc: 'Curated collection of interview questions across categories with bookmarking and practice tracking.', color: '#ec4899', path: '/question-bank' },
  ];

  return (
    <div className="landing-page">
      <ParticleField />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <svg viewBox="0 0 32 32" width="36" height="36" fill="none">
              <circle cx="16" cy="16" r="14" stroke="url(#lg)" strokeWidth="2.5" />
              <path d="M16 8L22 14H18V24H14V14H10L16 8Z" fill="url(#lg)" />
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ef4444" /><stop offset="1" stopColor="#991b1b" />
                </linearGradient>
              </defs>
            </svg>
            <span className="landing-logo-text">PrepAI</span>
          </div>
          <div className="landing-nav-links" aria-label="Landing page navigation">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#cta">Get started</a>
          </div>
          <div className="landing-nav-actions">
            {isAuthenticated ? (
              <button className="btn-landing-primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button className="btn-landing-ghost" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn-landing-primary" onClick={() => navigate('/register')}>
                  Get Started <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="landing-hero-badge animate-fade-in-up"><Sparkles size={14} /><span>Your interview prep, personalized by AI</span></div>
            <h1 className="landing-hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Turn every application into a <span className="landing-gradient-text">focused prep plan.</span>
            </h1>
            <p className="landing-hero-desc animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Match your resume to the role, close skill gaps, follow a practical roadmap,
              and rehearse the questions you are most likely to face.
            </p>
            <div className="landing-hero-cta animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button className="btn-landing-primary btn-landing-lg" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}>
                {isAuthenticated ? 'Open Dashboard' : 'Build My Prep Plan'} <ArrowRight size={18} />
              </button>
              <button className="btn-landing-outline btn-landing-lg" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
                <Play size={16} /> See How It Works
              </button>
            </div>
            <div className="landing-hero-checks animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <span><CheckCircle2 size={15} /> Role-specific practice</span>
              <span><CheckCircle2 size={15} /> Actionable feedback</span>
              <span><CheckCircle2 size={15} /> Progress in one place</span>
            </div>
          </div>
          <div className="landing-product-preview animate-fade-in-up" style={{ animationDelay: '0.2s' }} aria-label="PrepAI dashboard preview">
            <div className="preview-window-bar"><i /><i /><i /><span>prep workspace</span></div>
            <div className="preview-body">
              <div className="preview-sidebar"><div className="preview-brand"><Sparkles size={15} /> PrepAI</div>{['Overview', 'Skill gap', 'Roadmap', 'Mock interview'].map((item, i) => <div key={item} className={`preview-nav-item ${i === 0 ? 'active' : ''}`}>{item}</div>)}</div>
              <div className="preview-content">
                <div className="preview-eyebrow">PREP READINESS</div><div className="preview-heading">Backend Engineer</div>
                <div className="preview-metrics">
                  <div className="preview-score"><strong>78</strong><span>Match score</span></div>
                  <div className="preview-mini-card"><Target size={18} /><strong>6</strong><span>skills matched</span></div>
                  <div className="preview-mini-card"><Clock3 size={18} /><strong>4 wk</strong><span>prep roadmap</span></div>
                </div>
                <div className="preview-panel"><div className="preview-panel-head"><span>Your next focus</span><b>3 tasks</b></div>
                  {[
                    ['System design fundamentals', 'In progress', '62%'],
                    ['SQL query optimization', 'Next up', '35%'],
                    ['Behavioral mock interview', 'Scheduled', '18%'],
                  ].map(([name, status, width]) => <div className="preview-task" key={name}><div><strong>{name}</strong><span>{status}</span></div><div className="preview-progress"><i style={{ width }} /></div></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Orbs */}
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </section>

      <section className="landing-proof" aria-label="Platform capabilities">
        <div><strong>01</strong><span>Resume + JD analysis</span></div><div><strong>02</strong><span>Personalized skill roadmap</span></div>
        <div><strong>03</strong><span>AI interview rehearsal</span></div><div><strong>04</strong><span>Measurable progress</span></div>
      </section>


      {/* Features Section */}
      <section className="landing-features" id="features" data-animate>
        <div className="landing-section-inner">
          <div className={`landing-section-header ${visibleSections.has('features') ? 'animate-in' : ''}`}>
            <div className="landing-section-badge"><Zap size={14} /> Core Features</div>
            <h2 className="landing-section-title">Everything You Need to<br /><span className="landing-gradient-text">Succeed</span></h2>
            <p className="landing-section-desc">
              Six powerful tools working together to prepare you for every aspect of the interview process.
            </p>
          </div>
          <div className="landing-features-grid">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`landing-feature-card ${visibleSections.has('features') ? 'animate-in' : ''}`}
                style={{ animationDelay: `${i * 0.1}s`, cursor: 'pointer' }}
                onClick={() => navigate(isAuthenticated ? feature.path : '/login')}
              >
                <div className="landing-feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                  <feature.icon size={24} />
                </div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-desc">{feature.desc}</p>
                <div className="landing-feature-link">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="landing-how" id="how" data-animate>
        <div className="landing-section-inner">
          <div className={`landing-section-header ${visibleSections.has('how') ? 'animate-in' : ''}`}>
            <div className="landing-section-badge"><Brain size={14} /> How It Works</div>
            <h2 className="landing-section-title">Three Simple Steps to<br /><span className="landing-gradient-text">Interview Ready</span></h2>
          </div>
          <div className="landing-steps">
            {[
              { step: '01', title: 'Upload & Analyze', desc: 'Upload your resume and target job descriptions. Our AI instantly parses and analyzes them.', icon: FileText },
              { step: '02', title: 'Practice & Improve', desc: 'Take AI-generated mock interviews, study DSA, and practice with our curated question bank.', icon: MessageSquare },
              { step: '03', title: 'Track & Succeed', desc: 'Monitor your progress, maintain streaks, earn achievements, and land your dream role.', icon: Star },
            ].map((item, i) => (
              <div
                key={i}
                className={`landing-step-card ${visibleSections.has('how') ? 'animate-in' : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="landing-step-number">{item.step}</div>
                <div className="landing-step-icon"><item.icon size={28} /></div>
                <h3 className="landing-step-title">{item.title}</h3>
                <p className="landing-step-desc">{item.desc}</p>
                {i < 2 && <div className="landing-step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" id="cta" data-animate>
        <div className={`landing-cta-inner ${visibleSections.has('cta') ? 'animate-in' : ''}`}>
          <div className="landing-cta-glow" />
          <Shield size={40} className="landing-cta-icon" />
          <h2 className="landing-cta-title">Ready to Land Your Dream Job?</h2>
          <p className="landing-cta-desc">
            Join PrepAI today and start preparing smarter with AI-powered tools.
          </p>
          {isAuthenticated ? (
            <button className="btn-landing-primary btn-landing-lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn-landing-primary btn-landing-lg" onClick={() => navigate('/register')}>
              Get Started Free <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-logo">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
              <circle cx="16" cy="16" r="14" stroke="url(#lgf)" strokeWidth="2.5" />
              <path d="M16 8L22 14H18V24H14V14H10L16 8Z" fill="url(#lgf)" />
              <defs>
                <linearGradient id="lgf" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ef4444" /><stop offset="1" stopColor="#991b1b" />
                </linearGradient>
              </defs>
            </svg>
            <span className="landing-logo-text" style={{ fontSize: '1rem' }}>PrepAI</span>
          </div>
          <p className="landing-footer-text">© {new Date().getFullYear()} PrepAI. Built for focused interview preparation.</p>
        </div>
      </footer>
    </div>
  );
}

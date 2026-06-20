import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    await register(fullName, email, password);
    if (useAuthStore.getState().isAuthenticated) {
      navigate('/dashboard');
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="sidebar-logo" style={{ justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
          <svg className="logo-svg" viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <circle cx="16" cy="16" r="14" stroke="url(#logo-grad-reg)" strokeWidth="3" />
            <path d="M16 8L22 14H18V24H14V14H10L16 8Z" fill="url(#logo-grad-reg)" />
            <defs>
              <linearGradient id="logo-grad-reg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ef4444" />
                <stop offset="1" stopColor="#991b1b" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 'var(--font-xl)', letterSpacing: '-0.03em' }}>PrepAI</span>
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Start your interview preparation journey</p>

        {displayError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            color: 'var(--accent-rose)',
            fontSize: 'var(--font-sm)',
          }}>
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLocalError(''); }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

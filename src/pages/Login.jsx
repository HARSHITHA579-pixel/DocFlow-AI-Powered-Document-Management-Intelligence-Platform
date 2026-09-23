import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Zap,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();

  // Initialize with demo credentials by default for effortless testing
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isDemoSigningIn, setIsDemoSigningIn] = useState(false);

  // If already authenticated, redirect to /dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname && location.state?.from?.pathname !== '/login'
        ? location.state.from.pathname
        : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }
    setError('');

    try {
      await login(email, password, rememberMe);
      const destination = location.state?.from?.pathname && location.state?.from?.pathname !== '/login'
        ? location.state.from.pathname
        : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError('Invalid email or password. You can use the demo credentials below.');
    }
  };

  const handle1ClickDemoLogin = async () => {
    setError('');
    setIsDemoSigningIn(true);
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    try {
      await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, rememberMe);
      const destination = location.state?.from?.pathname && location.state?.from?.pathname !== '/login'
        ? location.state.from.pathname
        : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError('Failed to log in with demo credentials');
      setIsDemoSigningIn(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="login-page-wrapper">
      {/* Top Left: Back to Home / Landing */}
      <div className="login-top-left">
        <Link to="/landing" className="login-back-link" id="login-back-home-link">
          <ArrowLeft size={16} />
          <span>Product Overview</span>
        </Link>
      </div>

      {/* Top Right: Light / Dark Theme Switcher */}
      <div className="login-top-right">
        <ThemeToggle />
      </div>

      {/* Center: Login Card */}
      <div className="login-card fade-in">
        <div className="login-header">
          <Link to="/landing" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <div className="login-logo-wrap">
              <div className="brand-icon" style={{ width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto' }}>
                <Layers size={30} />
              </div>
            </div>
          </Link>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
            Sign in to DocFlow
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Access your intelligent document workspace & dashboard
          </p>
        </div>

        {/* 1-Click Instant Demo Login Banner Button */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handle1ClickDemoLogin}
            disabled={loading || isDemoSigningIn}
            id="one-click-demo-login-btn"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              cursor: 'pointer'
            }}
          >
            <Zap size={18} fill="#ffffff" />
            <span>{isDemoSigningIn ? 'Entering Dashboard...' : '1-Click Demo Login to Dashboard'}</span>
            <ArrowRight size={17} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or sign in with credentials</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {error && (
          <div
            className="login-error-alert"
            id="login-error-message"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Email Address</label>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Auto-fill demo
              </button>
            </div>
            <div className="search-input-wrapper">
              <Mail size={16} className="search-icon" />
              <input
                type="email"
                id="login-email-input"
                className="search-input"
                placeholder="demo@docflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <span
                style={{ fontSize: '0.75rem', color: '#818cf8', cursor: 'pointer', opacity: 0.85 }}
                onClick={() => {
                  setPassword(DEMO_CREDENTIALS.password);
                  setError('');
                }}
              >
                Use DocFlow123
              </span>
            </div>
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
              <Lock size={16} className="search-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password-input"
                className="search-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '28px',
                  height: '28px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                id="toggle-password-visibility-btn"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                id="remember-me-checkbox"
              />
              <span>Remember me</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.78rem' }}>
              <CheckCircle2 size={13} />
              <span>Demo Ready</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            id="login-submit-btn"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.3rem', fontSize: '0.95rem', fontWeight: '600' }}
            disabled={loading || isDemoSigningIn}
          >
            <KeyRound size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="login-demo-hint" style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', color: 'var(--text-main)' }}>
              <Sparkles size={14} color="#a5b4fc" />
              <span>Demo Credentials</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              id="fill-demo-credentials-btn"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '0.72rem',
                padding: '2px 7px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Fill Credentials
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>Email: <strong style={{ color: 'var(--text-main)', userSelect: 'all' }}>demo@docflow.com</strong></div>
            <div>Password: <strong style={{ color: 'var(--text-main)', userSelect: 'all' }}>DocFlow123</strong></div>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: 'var(--text-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} color="#34d399" />
            <span>Encrypted cloud workspace session with Supabase & Gemini AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

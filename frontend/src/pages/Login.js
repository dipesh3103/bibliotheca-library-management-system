import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="icon">📚</div>
          <h1>Bibliotheca</h1>
          <p>Library Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@library.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: 'rgba(201,168,76,0.07)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.2)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Demo Credentials</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📧 admin@library.com</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🔑 admin123</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Run <code style={{ color: 'var(--accent)', background: 'rgba(201,168,76,0.1)', padding: '1px 4px', borderRadius: 3 }}>POST /api/auth/seed</code> to create admin</p>
        </div>
      </div>
    </div>
  );
}

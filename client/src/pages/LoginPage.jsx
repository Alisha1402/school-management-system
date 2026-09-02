import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
      else navigate('/');
    } else {
      setErrorMessage(result.message);
    }
  };

  // Quick fill helper for instant testing of all roles
  const fillDemoCredentials = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setLoading(true);

    const result = await login(demoEmail, demoPassword);
    setLoading(false);

    if (result.success) {
      const role = result.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
      else navigate('/');
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your School Management Portal</p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div className="demo-accounts-box">
          <p className="demo-title">⚡ 1-Click Quick Demo Login (Session 2026-27):</p>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="demo-btn demo-admin"
              onClick={() => fillDemoCredentials('admin@school.com', 'admin123')}
              disabled={loading}
              title="Dr. Rajeshwar Prasad (Principal)"
            >
              👑 Principal / Admin
            </button>
            <button
              type="button"
              className="demo-btn demo-teacher"
              onClick={() => fillDemoCredentials('teacher@school.com', 'teacher123')}
              disabled={loading}
              title="Mrs. Neha Sharma (Mathematics)"
            >
              👨‍🏫 Mrs. Neha Sharma
            </button>
            <button
              type="button"
              className="demo-btn demo-student"
              onClick={() => fillDemoCredentials('student@school.com', 'student123')}
              disabled={loading}
              title="Aarav Sharma (Class 10-A, Roll #101)"
            >
              🎒 Aarav Sharma
            </button>
          </div>
        </div>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleLogin} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@school.com"
              autoComplete="username"
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !email || !password}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

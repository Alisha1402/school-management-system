import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      default:
        return '/login';
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⛔</div>
        <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>403 - Access Denied</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          You do not have permission to view this section with your current role{' '}
          {user?.role && (
            <span
              className={`badge badge-${user.role}`}
              style={{ display: 'inline-block', marginLeft: '0.25rem' }}
            >
              {user.role.toUpperCase()}
            </span>
          )}
          .
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link
            to={getDashboardPath(user?.role)}
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Return to My Portal
          </Link>
          <Link
            to="/login"
            className="btn btn-outline-danger"
            style={{ textDecoration: 'none' }}
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

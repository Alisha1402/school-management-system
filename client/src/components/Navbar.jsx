import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Notification Bell State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/communication/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/communication/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge badge-admin';
      case 'teacher':
        return 'badge badge-teacher';
      case 'student':
        return 'badge badge-student';
      default:
        return 'badge';
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      default:
        return '/';
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={isAuthenticated ? getDashboardPath(user?.role) : '/login'} className="nav-brand">
          <span className="brand-icon">🏫</span>
          <span className="brand-name">School Management System</span>
          <span className="brand-subtitle">CBSE 2026-27</span>
        </Link>

        {isAuthenticated && user && (
          <div className="nav-user-section">
            {/* 🔔 Real-time Notifications Bell */}
            <div className="nav-notification-container" style={{ position: 'relative' }}>
              <button
                type="button"
                className="nav-notification-bell-btn"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                title="View Announcements & Alerts"
              >
                🔔
                {unreadCount > 0 && <span className="notification-badge-count">{unreadCount}</span>}
              </button>

              {/* Notification Dropdown Box */}
              {showNotificationDropdown && (
                <div className="notification-dropdown-box">
                  <div className="notification-dropdown-header">
                    <div>
                      <strong>Notifications & Circulars</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="btn-link"
                        style={{ fontSize: '0.75rem', color: '#4f46e5', cursor: 'pointer' }}
                      >
                        Mark All Read
                      </button>
                    )}
                  </div>

                  <div className="notification-items-list">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`notification-item-card ${!n.isRead ? 'unread' : ''}`}
                        >
                          <div className="notification-item-top">
                            <span className="notification-type-tag">{n.type?.toUpperCase()}</span>
                            <span className="notification-time-ago">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <strong className="notification-item-title">{n.title}</strong>
                          <p className="notification-item-msg">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="empty-notif-msg">No alerts or circulars at this moment.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={getRoleBadgeClass(user.role)}>
                {user.role === 'admin' ? 'PRINCIPAL' : user.role.toUpperCase()}
              </span>
            </div>

            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

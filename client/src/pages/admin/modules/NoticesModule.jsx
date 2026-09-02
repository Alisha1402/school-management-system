import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const NoticesModule = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'Important Announcement',
    audience: 'All',
    priority: 'High',
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/communication/notices');
      if (res.data.success) {
        setNotices(res.data.notices);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAddNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communication/notices', newNotice);
      if (res.data.success) {
        setShowAddModal(false);
        setNewNotice({
          title: '',
          content: '',
          category: 'Important Announcement',
          audience: 'All',
          priority: 'High',
        });
        fetchNotices();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting notice');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/communication/notices/${id}`);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchesAudience = audienceFilter === 'All' || n.audience === audienceFilter;
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    return matchesAudience && matchesCategory;
  });

  return (
    <div className="module-view-container">
      {/* Controls Bar */}
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 Official School Circulars & Notice Board</h3>
          <p className="subtitle">Publish holiday notifications, PTM circulars, exam notices, and school announcements</p>
        </div>

        <div className="search-filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Categories</option>
            <option value="Holiday Notice">Holiday Notices</option>
            <option value="PTM Notice">PTM Notices</option>
            <option value="Exam Notice">Exam Notices</option>
            <option value="School Event">School Events</option>
            <option value="Important Announcement">Important Announcements</option>
          </select>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Audiences</option>
            <option value="Students">Students Only</option>
            <option value="Teachers">Faculty & Staff</option>
            <option value="Parents">Parents</option>
          </select>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            + Publish Official Circular
          </button>
        </div>
      </div>

      {/* Notices Board Cards */}
      <div className="notices-grid">
        {loading ? (
          <div className="module-loading">Loading school notices...</div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((n) => (
            <div key={n._id} className="card notice-card">
              <div className="notice-card-header">
                <div className="notice-meta-tags">
                  <span className="badge badge-teacher">{n.category || 'Important Announcement'}</span>
                  <span className={`priority-pill priority-${(n.priority || 'medium').toLowerCase()}`}>
                    {n.priority} Priority
                  </span>
                  <span className="audience-pill">{n.audience}</span>
                </div>
                <button
                  onClick={() => handleDeleteNotice(n._id)}
                  className="btn-icon-danger"
                  title="Delete notice"
                >
                  🗑️
                </button>
              </div>

              <h3 className="notice-title">{n.title}</h3>
              <p className="notice-content">{n.content}</p>

              <div className="notice-footer">
                <span>✍️ Issued by: <strong>{n.postedBy || 'Principal Office'}</strong></span>
                <span>📅 {new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-table-msg card">No announcements currently published.</div>
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>📢 Publish School Circular</h3>
              <button onClick={() => setShowAddModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleAddNotice} className="modal-form">
              <div className="form-group">
                <label>Circular Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. School Holiday Notice: Mahatma Gandhi Jayanti"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Category *</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="Holiday Notice">Holiday Notice</option>
                    <option value="PTM Notice">PTM Notice</option>
                    <option value="Exam Notice">Exam Notice</option>
                    <option value="School Event">School Event</option>
                    <option value="Important Announcement">Important Announcement</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Target Audience *</label>
                  <select
                    value={newNotice.audience}
                    onChange={(e) => setNewNotice({ ...newNotice, audience: e.target.value })}
                    className="form-control"
                  >
                    <option value="All">All (School Community)</option>
                    <option value="Students">Students</option>
                    <option value="Teachers">Teachers / Faculty</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Priority Level</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="form-control"
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🔵 Low</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Circular Body & Details *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Type the full announcement message here..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Broadcast Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesModule;

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const ComplaintsModule = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [resolutionText, setResolutionText] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/communication/complaints');
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRespond = async (id, status, responseText) => {
    try {
      const res = await api.patch(`/communication/complaints/${id}/respond`, {
        status,
        adminResponse: responseText,
      });
      if (res.data.success) {
        setSelectedComplaint(null);
        setResolutionText('');
        fetchComplaints();
      }
    } catch (err) {
      alert('Failed to respond to complaint');
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  return (
    <div className="module-view-container">
      {/* Controls Bar */}
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 Student Grievance & Complaint Redressal Desk</h3>
          <p className="subtitle">Review student queries, assign investigation, and post official resolution remarks</p>
        </div>

        <div className="search-filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Transport">Transport</option>
            <option value="Fee/Accounts">Fee/Accounts</option>
            <option value="Discipline">Discipline</option>
            <option value="General">General</option>
          </select>

          <div className="status-filter-buttons">
            <button
              className={`filter-tab ${statusFilter === 'All' ? 'active' : ''}`}
              onClick={() => setStatusFilter('All')}
            >
              All ({complaints.length})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'Pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Pending')}
            >
              🔴 Pending ({complaints.filter((c) => c.status === 'Pending').length})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'In Progress' ? 'active' : ''}`}
              onClick={() => setStatusFilter('In Progress')}
            >
              🟡 In Progress ({complaints.filter((c) => c.status === 'In Progress').length})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'Resolved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Resolved')}
            >
              🟢 Resolved ({complaints.filter((c) => c.status === 'Resolved').length})
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="complaints-list">
        {loading ? (
          <div className="module-loading">Loading complaints...</div>
        ) : filtered.length > 0 ? (
          filtered.map((c) => (
            <div key={c._id} className="card complaint-card">
              <div className="complaint-card-header">
                <div>
                  <span className={`status-pill status-${c.status === 'Resolved' ? 'approved' : c.status === 'In Progress' ? 'in-progress' : 'pending'}`}>
                    {c.status}
                  </span>
                  <span className="category-pill">{c.category}</span>
                </div>
                <span className="complaint-date">📅 {new Date(c.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="complaint-title">{c.subject}</h3>
              <p className="complaint-desc">{c.description}</p>

              {c.adminResponse && (
                <div className="resolution-box" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '6px', margin: '0.75rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#166534' }}>✔ Official Redressal Response:</strong>
                    <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Resolved by {c.resolvedBy}</span>
                  </div>
                  <p style={{ margin: 0, color: '#14532d', fontSize: '0.9rem' }}>{c.adminResponse}</p>
                </div>
              )}

              <div className="complaint-footer">
                <div className="submitted-by-tag">
                  👤 Student: <strong>{c.studentName}</strong> (Roll #{c.rollNumber || '101'} • {c.className})
                </div>

                <div className="complaint-action-btns">
                  {c.status === 'Pending' && (
                    <button
                      onClick={() => handleRespond(c._id, 'In Progress', 'Grievance assigned to department in-charge for review.')}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Assign In-Progress
                    </button>
                  )}
                  {c.status !== 'Resolved' && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setResolutionText(c.adminResponse || '');
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      💬 Respond & Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-table-msg card">No grievances in this view.</div>
        )}
      </div>

      {/* Resolve Modal */}
      {selectedComplaint && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>💬 Redress Grievance</h3>
              <button onClick={() => setSelectedComplaint(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-form">
              <p><strong>Subject:</strong> {selectedComplaint.subject}</p>
              <p><strong>Student:</strong> {selectedComplaint.studentName} ({selectedComplaint.className})</p>
              
              <div className="form-group">
                <label>Official Resolution Remark & Action *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Extra doubt workshop scheduled on Thursday morning in Room 101."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRespond(selectedComplaint._id, 'Resolved', resolutionText)}
                  className="btn btn-primary"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsModule;

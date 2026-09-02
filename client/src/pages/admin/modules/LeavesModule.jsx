import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const LeavesModule = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/communication/leaves');
      if (res.data.success) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status, adminRemark = '') => {
    try {
      const res = await api.patch(`/communication/leaves/${id}/review`, {
        status,
        adminRemark: adminRemark || (status === 'Approved' ? 'Leave sanctioned.' : 'Leave application rejected.'),
      });
      if (res.data.success) {
        fetchLeaves();
      }
    } catch (err) {
      alert('Failed to update leave status');
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    const matchesRole = roleFilter === 'All' || l.applicantRole === roleFilter;
    return matchesStatus && matchesRole;
  });

  return (
    <div className="module-view-container">
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 Student & Faculty Leave Sanction Desk</h3>
          <p className="subtitle">Review absence requests, medical certificates, and grant authorized leave approvals</p>
        </div>

        <div className="search-filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers / Faculty</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">🟡 Pending</option>
            <option value="Approved">🟢 Approved</option>
            <option value="Rejected">🔴 Rejected</option>
          </select>
        </div>
      </div>

      <div className="table-responsive card">
        {loading ? (
          <div className="module-loading">Loading leave applications...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Role & Class</th>
                <th>Leave Type</th>
                <th>Duration (From - To)</th>
                <th>Total Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Decision & Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((l) => (
                  <tr key={l._id}>
                    <td><strong>{l.applicantName}</strong></td>
                    <td>
                      <span className={`badge badge-${l.applicantRole}`}>
                        {l.applicantRole.toUpperCase()}
                      </span>{' '}
                      {l.className && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({l.className})</span>}
                    </td>
                    <td><strong>{l.leaveType}</strong></td>
                    <td>
                      📅 {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td><span className="code-pill">{l.totalDays} Day{l.totalDays !== 1 ? 's' : ''}</span></td>
                    <td>{l.reason}</td>
                    <td>
                      <span className={`status-pill status-${l.status === 'Approved' ? 'approved' : l.status === 'Rejected' ? 'danger' : 'in-progress'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdateStatus(l._id, 'Approved', 'Leave sanctioned by Principal.')}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                          >
                            ✔ Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(l._id, 'Rejected', 'Insufficient attendance / rejected.')}
                            className="btn btn-outline-danger btn-sm"
                          >
                            ✖ Reject
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong style={{ color: l.status === 'Approved' ? '#10b981' : '#ef4444' }}>{l.status}</strong>
                          <div style={{ color: '#64748b' }}>By {l.reviewedBy || 'Office'}</div>
                          {l.adminRemark && <div style={{ fontStyle: 'italic' }}>"{l.adminRemark}"</div>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table-msg">
                    No leave applications matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeavesModule;

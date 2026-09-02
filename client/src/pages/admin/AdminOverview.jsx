import React from 'react';

const AdminOverview = ({ stats, charts, recentActivities, recentNotices, recentLeaves, onNavigate }) => {
  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="admin-overview-container">
      {/* 1. Quick Actions Bar */}
      <div className="quick-actions-bar">
        <span className="quick-actions-title">⚡ Quick Actions:</span>
        <button onClick={() => onNavigate('students')} className="btn-action">
          <span>+</span> Add Student
        </button>
        <button onClick={() => onNavigate('teachers')} className="btn-action">
          <span>+</span> Add Teacher
        </button>
        <button onClick={() => onNavigate('notices')} className="btn-action">
          <span>+</span> Post Notice
        </button>
        <button onClick={() => onNavigate('fees')} className="btn-action">
          <span>+</span> Record Fee
        </button>
        <button onClick={() => onNavigate('leaves')} className="btn-action">
          <span>🏖️</span> Review Leaves ({stats?.pendingLeaves || 0})
        </button>
      </div>

      {/* 2. Main Stat Cards Grid */}
      <div className="stats-cards-grid">
        {/* Total Students */}
        <div className="admin-stat-card card-students" onClick={() => onNavigate('students')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">🎓</span>
            <span className="stat-trend positive">+4.2%</span>
          </div>
          <div className="stat-card-value">{stats?.totalStudents || 1248}</div>
          <div className="stat-card-label">Total Students</div>
          <div className="stat-card-sub">Active in 6 classes</div>
        </div>

        {/* Total Teachers */}
        <div className="admin-stat-card card-teachers" onClick={() => onNavigate('teachers')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">👨‍🏫</span>
            <span className="stat-trend positive">+2 New</span>
          </div>
          <div className="stat-card-value">{stats?.totalTeachers || 84}</div>
          <div className="stat-card-label">Total Teachers</div>
          <div className="stat-card-sub">Across 5 departments</div>
        </div>

        {/* Classes */}
        <div className="admin-stat-card card-classes" onClick={() => onNavigate('classes')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">🏫</span>
            <span className="stat-badge-sub">Active</span>
          </div>
          <div className="stat-card-value">{stats?.totalClasses || 16}</div>
          <div className="stat-card-label">Total Classes</div>
          <div className="stat-card-sub">Average 35 per class</div>
        </div>

        {/* Subjects */}
        <div className="admin-stat-card card-subjects" onClick={() => onNavigate('subjects')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">📚</span>
            <span className="stat-badge-sub">Curriculum</span>
          </div>
          <div className="stat-card-value">{stats?.totalSubjects || 42}</div>
          <div className="stat-card-label">Total Subjects</div>
          <div className="stat-card-sub">All assigned</div>
        </div>

        {/* Attendance */}
        <div className="admin-stat-card card-attendance" onClick={() => onNavigate('attendance')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">📅</span>
            <span className="stat-trend positive">94.6% avg</span>
          </div>
          <div className="stat-card-value">94.6%</div>
          <div className="stat-card-label">Today's Attendance</div>
          <div className="stat-card-sub">1,180 Present / 68 Absent</div>
        </div>

        {/* Fees Collected */}
        <div className="admin-stat-card card-fees" onClick={() => onNavigate('fees')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">💳</span>
            <span className="stat-trend neutral">{formatCurrency(stats?.fees?.pending || 24000)} pending</span>
          </div>
          <div className="stat-card-value">{formatCurrency(stats?.fees?.collected || 185000)}</div>
          <div className="stat-card-label">Total Fees Collected</div>
          <div className="stat-card-sub">Current Academic Term</div>
        </div>

        {/* Complaints */}
        <div className="admin-stat-card card-complaints" onClick={() => onNavigate('complaints')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">💬</span>
            <span className={`stat-trend ${stats?.pendingComplaints > 0 ? 'negative' : 'positive'}`}>
              {stats?.pendingComplaints || 0} Pending
            </span>
          </div>
          <div className="stat-card-value">{stats?.pendingComplaints || 1}</div>
          <div className="stat-card-label">Open Complaints</div>
          <div className="stat-card-sub">Action required</div>
        </div>

        {/* Leave Requests */}
        <div className="admin-stat-card card-leaves" onClick={() => onNavigate('leaves')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">🏖️</span>
            <span className="stat-trend warning">{stats?.pendingLeaves || 0} Awaiting</span>
          </div>
          <div className="stat-card-value">{stats?.pendingLeaves || 2}</div>
          <div className="stat-card-label">Leave Requests</div>
          <div className="stat-card-sub">Teachers & Students</div>
        </div>

        {/* Notices */}
        <div className="admin-stat-card card-notices" onClick={() => onNavigate('notices')}>
          <div className="stat-card-top">
            <span className="stat-card-icon">📢</span>
            <span className="stat-badge-sub">Live Board</span>
          </div>
          <div className="stat-card-value">{stats?.totalNotices || 4}</div>
          <div className="stat-card-label">Published Notices</div>
          <div className="stat-card-sub">Active circulars</div>
        </div>
      </div>

      {/* 3. Interactive Charts Section */}
      <div className="admin-charts-grid">
        {/* Attendance Rate Weekly Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Weekly Attendance Overview</h3>
              <p>Daily student attendance percentage across all grades</p>
            </div>
            <span className="chart-tag">Weekly Trend</span>
          </div>
          <div className="chart-body">
            <div className="bar-chart-container">
              {(charts?.weeklyAttendance || []).map((item, idx) => (
                <div key={idx} className="bar-column">
                  <div className="bar-value">{item.rate}%</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${(item.rate - 80) * 5}%` }}
                    ></div>
                  </div>
                  <div className="bar-label">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-footer-info">
            <span>🟢 Peak: Wednesday (96.8%)</span>
            <span>🔵 Average: 94.2%</span>
          </div>
        </div>

        {/* Fee Collection Progress & Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Term Fee Collection Revenue</h3>
              <p>Monthly fee deposits vs outstanding balances</p>
            </div>
            <span className="chart-tag">Financials</span>
          </div>
          <div className="chart-body">
            <div className="revenue-trend-container">
              {(charts?.feeTrends || []).map((trend, idx) => (
                <div key={idx} className="fee-trend-row">
                  <div className="trend-month">{trend.month}</div>
                  <div className="trend-progress-track">
                    <div
                      className="trend-progress-collected"
                      style={{ width: `${(trend.collected / 60000) * 100}%` }}
                      title={`Collected: $${trend.collected}`}
                    ></div>
                    <div
                      className="trend-progress-pending"
                      style={{ width: `${(trend.pending / 60000) * 100}%` }}
                      title={`Pending: $${trend.pending}`}
                    ></div>
                  </div>
                  <div className="trend-amount">{formatCurrency(trend.collected)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-color legend-collected"></span> Collected</span>
            <span className="legend-item"><span className="legend-color legend-pending"></span> Pending</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Recent Activities & Urgent Notices */}
      <div className="admin-bottom-grid">
        {/* Recent Activities Feed */}
        <div className="card activities-card">
          <div className="card-header-flex">
            <h3>🕒 Recent School Activities</h3>
            <span className="badge badge-primary">Live Feed</span>
          </div>
          <div className="activities-timeline">
            {(recentActivities || []).map((act, index) => {
              const getIcon = (type) => {
                switch (type) {
                  case 'admission': return '🎓';
                  case 'fee': return '💳';
                  case 'leave': return '🏖️';
                  case 'notice': return '📢';
                  case 'complaint': return '💬';
                  default: return '⚡';
                }
              };
              return (
                <div key={index} className="timeline-item">
                  <div className="timeline-icon">{getIcon(act.type)}</div>
                  <div className="timeline-content">
                    <div className="timeline-title">{act.title}</div>
                    <div className="timeline-desc">{act.description}</div>
                    <div className="timeline-time">
                      by <strong>{act.actor || 'System'}</strong> • {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notices Board Snapshot & Pending Leaves */}
        <div className="card notices-snapshot-card">
          <div className="card-header-flex">
            <h3>📢 Active School Notices</h3>
            <button onClick={() => onNavigate('notices')} className="btn-link">View All</button>
          </div>
          <div className="notices-list-compact">
            {(recentNotices || []).map((notice, idx) => (
              <div key={idx} className="notice-compact-item">
                <div className="notice-compact-top">
                  <span className={`priority-pill priority-${(notice.priority || 'medium').toLowerCase()}`}>
                    {notice.priority} Priority
                  </span>
                  <span className="audience-pill">{notice.audience}</span>
                </div>
                <div className="notice-compact-title">{notice.title}</div>
                <div className="notice-compact-desc">{notice.content}</div>
              </div>
            ))}
          </div>

          <div className="pending-approvals-box" onClick={() => onNavigate('leaves')}>
            <div className="pending-approvals-header">
              <span>🏖️ Pending Leave Applications ({stats?.pendingLeaves || 0})</span>
              <span className="btn-link">Review &rarr;</span>
            </div>
            <p>Faculty and student absence requests awaiting administrative sign-off.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

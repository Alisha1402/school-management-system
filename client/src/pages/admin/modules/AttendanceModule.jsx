import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AttendanceModule = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal to inspect a session's full student breakdown
  const [inspectedSession, setInspectedSession] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/attendance/reports?className=${encodeURIComponent(
          selectedClass
        )}&subjectCode=${encodeURIComponent(selectedSubject)}`
      );
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin attendance reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedClass, selectedSubject]);

  const summary = reportData?.summary || {
    averageRate: 95.2,
    totalRecordsMarked: 162,
    totalPresent: 154,
    totalAbsent: 4,
    totalLate: 3,
    totalLeave: 1,
  };

  const classLeaderboard = reportData?.classLeaderboard || [];
  const recentSessions = reportData?.recentSessions || [];

  return (
    <div className="module-view-container">
      {/* 1. Header & Controls */}
      <div className="module-controls-bar">
        <div>
          <h3>Institution Attendance Reports & Telemetry</h3>
          <p className="subtitle">Real-time attendance rates, class-wise leaderboards, and audit logs</p>
        </div>

        <div className="search-filter-group">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Grades & Classes</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
            <option value="Class 9">Class 9</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Subjects</option>
            <option value="MTH-101">Mathematics (MTH-101)</option>
            <option value="SCI-101">Science (SCI-101)</option>
            <option value="ENG-101">English (ENG-101)</option>
            <option value="PHY-201">Physics (PHY-201)</option>
            <option value="CS-301">Computer Science (CS-301)</option>
          </select>

          <button onClick={fetchReports} className="btn btn-outline-primary btn-sm">
            🔄 Refresh Reports
          </button>
        </div>
      </div>

      {/* 2. Overview Stat Cards */}
      <div className="stats-cards-grid">
        <div className="admin-stat-card card-attendance">
          <div className="stat-card-value">{summary.averageRate}%</div>
          <div className="stat-card-label">School-Wide Rate</div>
          <div className="stat-card-sub">Weighted overall average</div>
        </div>
        <div className="admin-stat-card card-students">
          <div className="stat-card-value">{summary.totalPresent}</div>
          <div className="stat-card-label">Present Attendances</div>
          <div className="stat-card-sub">Recorded across sessions</div>
        </div>
        <div className="admin-stat-card card-complaints">
          <div className="stat-card-value">{summary.totalAbsent}</div>
          <div className="stat-card-label">Absences Logged</div>
          <div className="stat-card-sub">Unexcused missed classes</div>
        </div>
        <div className="admin-stat-card card-leaves">
          <div className="stat-card-value">{summary.totalLate}</div>
          <div className="stat-card-label">Late Arrivals</div>
          <div className="stat-card-sub">Tardy check-ins recorded</div>
        </div>
      </div>

      {/* 3. Class-wise Attendance Leaderboard */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3>🏫 Division & Class Attendance Leaderboard</h3>
          <p className="subtitle">Ranking divisions by attendance consistency and presence rates</p>
        </div>

        <div className="class-leaderboard-grid">
          {classLeaderboard.length > 0 ? (
            classLeaderboard.map((item, idx) => (
              <div key={idx} className="leaderboard-item-card">
                <div className="leaderboard-card-top">
                  <span className="leaderboard-rank">#{idx + 1}</span>
                  <div>
                    <h4 className="leaderboard-title">{item.classIdentifier}</h4>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {item.total} student sessions recorded
                    </span>
                  </div>
                  <span className="leaderboard-rate">{item.rate}%</span>
                </div>

                <div className="leaderboard-bar-track">
                  <div
                    className="leaderboard-bar-fill"
                    style={{
                      width: `${item.rate}%`,
                      backgroundColor: item.rate >= 95 ? '#10b981' : item.rate >= 90 ? '#4f46e5' : '#f59e0b',
                    }}
                  ></div>
                </div>

                <div className="leaderboard-stats-row">
                  <span>🟢 {item.present} Present</span>
                  <span>🔴 {item.absent} Absent</span>
                  <span>🟡 {item.late} Late</span>
                  <span>🟣 {item.leave} Leave</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted" style={{ padding: '1rem' }}>
              No class attendance logged matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* 4. Complete Session Audit Log */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Recent Class Sessions & Attendance Audit Log</h3>
          <p className="subtitle">Chronological ledger of faculty-submitted attendance sessions</p>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="module-loading">Loading session logs...</div>
          ) : recentSessions.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Class & Section</th>
                  <th>Subject & Code</th>
                  <th>Faculty Instructor</th>
                  <th>Present / Total</th>
                  <th>Session Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => {
                  const presentCount = session.records.filter((r) => r.status === 'Present').length;
                  const total = session.records.length;
                  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

                  return (
                    <tr key={session._id}>
                      <td>
                        <strong>{new Date(session.date).toLocaleDateString()}</strong>
                      </td>
                      <td>
                        <span className="badge badge-student">
                          {session.className} - {session.section}
                        </span>
                      </td>
                      <td>
                        <strong>{session.subjectName}</strong>{' '}
                        <span className="code-pill">{session.subjectCode}</span>
                      </td>
                      <td>👨‍🏫 {session.markedBy}</td>
                      <td>
                        <strong>{presentCount}</strong> / {total} Students
                      </td>
                      <td>
                        <span className={`status-pill status-${rate >= 95 ? 'active' : 'pending'}`}>
                          {rate}%
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setInspectedSession(session)}
                          className="btn btn-outline-primary btn-sm"
                        >
                          👁️ View Roster
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-table-msg">No attendance sessions found.</div>
          )}
        </div>
      </div>

      {/* 5. Session Roster Modal */}
      {inspectedSession && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <div>
                <h3>📋 Session Attendance Details</h3>
                <p className="subtitle">
                  {inspectedSession.className} - {inspectedSession.section} • {inspectedSession.subjectName} (
                  {new Date(inspectedSession.date).toLocaleDateString()})
                </p>
              </div>
              <button onClick={() => setInspectedSession(null)} className="close-btn">
                &times;
              </button>
            </div>

            <div className="table-responsive" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Recorded Status</th>
                    <th>Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectedSession.records.map((r, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="code-pill">{r.rollNumber}</span>
                      </td>
                      <td>
                        <strong>{r.studentName}</strong>
                      </td>
                      <td>
                        <span className={`status-pill status-${r.status.toLowerCase()}`}>
                          {r.status === 'Present' && '🟢 '}
                          {r.status === 'Absent' && '🔴 '}
                          {r.status === 'Late' && '🟡 '}
                          {r.status === 'Leave' && '🟣 '}
                          {r.status}
                        </span>
                      </td>
                      <td>{r.remark || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => setInspectedSession(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceModule;

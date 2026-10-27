import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AIPredictionsModule = () => {
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [recalculatingId, setRecalculatingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matrixRes, telRes] = await Promise.all([
        api.get(`/predictions/class-risk-matrix?className=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}`),
        api.get('/predictions/model-telemetry'),
      ]);

      if (matrixRes.data.success) {
        setMatrixData(matrixRes.data);
      }
      if (telRes.data.success) {
        setTelemetry(telRes.data.telemetry);
      }
    } catch (err) {
      console.error('Failed to fetch prediction telemetry and risk matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedSection]);

  const handleRecalculate = async (studentId) => {
    try {
      setRecalculatingId(studentId);
      const res = await api.post(`/predictions/generate/${studentId}`);
      if (res.data.success) {
        await fetchData();
        if (selectedStudentModal && selectedStudentModal.studentId === studentId) {
          setSelectedStudentModal(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to refresh forecast');
    } finally {
      setRecalculatingId(null);
    }
  };

  const summary = matrixData?.summary || {
    totalStudents: 0,
    averagePredictedScore: 0,
    projectedPassRate: 100,
    lowRiskCount: 0,
    moderateRiskCount: 0,
    highRiskCount: 0,
  };

  const studentsList = matrixData?.studentsMatrix || [];
  const filteredStudents = studentsList.filter((s) => {
    if (selectedRiskFilter === 'All') return true;
    return s.riskLevel === selectedRiskFilter;
  });

  return (
    <div className="module-view-container">
      {/* 1. Header Banner */}
      <div className="module-controls-bar">
        <div>
          <div className="badge badge-admin" style={{ marginBottom: '0.35rem' }}>
            🤖 AI Academic Intelligence • Machine Learning v1.0.0
          </div>
          <h3>AI Performance Prediction & Early Warning Matrix</h3>
          <p className="subtitle">
            Statistical regression forecasting based on attendance, coursework turnaround, and mid-term assessments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => window.print()} className="btn btn-outline">
            🖨️ Export Risk Report
          </button>
          <button onClick={fetchData} className="btn btn-primary">
            🔄 Refresh Predictions
          </button>
        </div>
      </div>

      {/* 2. Official Pedagogical Disclaimer */}
      <div
        className="card"
        style={{
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
        <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.4 }}>
          <strong>Notice to Faculty & Administrators:</strong> All performance predictions represent statistical estimates derived from empirical academic regressions. They serve as an early-intervention decision aid and do not constitute guaranteed or certified final examination results.
        </div>
      </div>

      {/* 3. High-Level AI Telemetry Cards */}
      <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3 style={{ color: '#4f46e5' }}>{summary.averagePredictedScore}%</h3>
            <p>Class Mean Projected Score</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <h3 style={{ color: '#10b981' }}>{summary.lowRiskCount}</h3>
            <p>On-Track Students (Safe / A1-B2)</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon">🟡</div>
          <div className="stat-info">
            <h3 style={{ color: '#f59e0b' }}>{summary.moderateRiskCount}</h3>
            <p>Moderate Risk (Needs Push)</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <h3 style={{ color: '#ef4444' }}>{summary.highRiskCount}</h3>
            <p>At-Risk (Action Required)</p>
          </div>
        </div>
      </div>

      {/* 4. Filter & Controls Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div className="search-filter-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-control"
            >
              <option value="Class 10">Class 10</option>
              <option value="Class 9">Class 9</option>
              <option value="All">All Classes</option>
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="form-control"
            >
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="All">All Sections</option>
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Filter by Risk Level
            </label>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="form-control"
            >
              <option value="All">All Risk Levels ({studentsList.length})</option>
              <option value="Low">Low Risk (Safe)</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="High">High Risk / Vulnerable</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Class Risk Matrix Table */}
      <div className="table-responsive card">
        {loading ? (
          <div className="module-loading" style={{ padding: '2rem', textAlign: 'center' }}>
            Analyzing classroom trajectories via Random Forest engine...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Attendance</th>
                <th>Homework</th>
                <th>Term Exam</th>
                <th>Predicted Score</th>
                <th>Projected Grade</th>
                <th>Risk Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.studentId}>
                    <td><strong>#{s.rollNumber}</strong></td>
                    <td>
                      <strong>{s.studentName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.admissionNumber}</div>
                    </td>
                    <td>
                      <span className={`badge ${s.attendanceRate >= 75 ? 'badge-student' : 'badge-danger'}`}>
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {s.assignmentCompletionRate}% completed
                      </span>
                    </td>
                    <td>
                      <strong>{s.midtermExamScore}%</strong>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: s.predictedFinalPercentage >= 75 ? '#10b981' : s.predictedFinalPercentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {s.predictedFinalPercentage}%
                      </strong>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        [{s.confidenceInterval?.minPercentage}% - {s.confidenceInterval?.maxPercentage}%]
                      </div>
                    </td>
                    <td>
                      <span className="code-pill" style={{ fontWeight: 700 }}>
                        {s.predictedCbseGrade}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${s.riskLevel === 'Low' ? 'approved' : s.riskLevel === 'Moderate' ? 'in-progress' : 'danger'}`}>
                        {s.riskLevel === 'Low' ? '🟢 Safe' : s.riskLevel === 'Moderate' ? '🟡 Moderate' : '🔴 At-Risk'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedStudentModal(s)}
                          className="btn btn-outline btn-sm"
                          title="View Diagnostic Breakdown"
                        >
                          🔍 Breakdown
                        </button>
                        <button
                          onClick={() => handleRecalculate(s.studentId)}
                          disabled={recalculatingId === s.studentId}
                          className="btn btn-primary btn-sm"
                          title="Recalculate with fresh inputs"
                        >
                          {recalculatingId === s.studentId ? '...' : '🔄'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty-table-msg">
                    No students matching the selected risk filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 6. Model Specification & Metadata Card */}
      {telemetry && (
        <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>
            ⚙️ AI Model Specification & Validation Architecture
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Algorithm:</span>
              <div><strong>{telemetry.algorithm}</strong></div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Model Version:</span>
              <div><code>{telemetry.model_version}</code></div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Benchmark Hold-out R²:</span>
              <div><strong style={{ color: '#10b981' }}>{telemetry.metrics?.test_r2}</strong></div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Mean Absolute Error (MAE):</span>
              <div><strong>±{telemetry.metrics?.test_mae}%</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Detailed Diagnostic Modal Dialog */}
      {selectedStudentModal && (
        <div className="modal-overlay" onClick={() => setSelectedStudentModal(null)}>
          <div className="modal-box" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Diagnostic AI Report: {selectedStudentModal.studentName}</h3>
              <button className="close-btn" onClick={() => setSelectedStudentModal(null)}>✖</button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Projected Annual Score</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5' }}>
                    {selectedStudentModal.predictedFinalPercentage}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Model Range: [{selectedStudentModal.confidenceInterval?.minPercentage}% – {selectedStudentModal.confidenceInterval?.maxPercentage}%]
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>CBSE Grade & Risk</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Grade {selectedStudentModal.predictedCbseGrade}</div>
                  <span className={`status-pill status-${selectedStudentModal.riskLevel === 'Low' ? 'approved' : selectedStudentModal.riskLevel === 'Moderate' ? 'in-progress' : 'danger'}`}>
                    {selectedStudentModal.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Feature Drivers */}
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Key Factor Performance:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Term Exam Baseline (83.5% weight):</span>
                  <strong>{selectedStudentModal.midtermExamScore}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Homework Completion (5.8% weight):</span>
                  <strong>{selectedStudentModal.assignmentCompletionRate}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Classroom Attendance (2.2% weight):</span>
                  <strong style={{ color: selectedStudentModal.attendanceRate < 75 ? '#ef4444' : 'inherit' }}>
                    {selectedStudentModal.attendanceRate}%
                  </strong>
                </div>
              </div>

              {/* Actionable Interventions */}
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Evidence-Based Improvement Interventions:</h4>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.75rem 1rem' }}>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
                  {selectedStudentModal.interventions && selectedStudentModal.interventions.length > 0 ? (
                    selectedStudentModal.interventions.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                    ))
                  ) : (
                    <li>Maintain current academic trajectory and regular classroom attendance.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedStudentModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionsModule;

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

// --- Assignments Module (Phase 7 Enhanced) ---
export const AssignmentsModule = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assignments?className=${encodeURIComponent(selectedClass)}&subjectCode=${encodeURIComponent(selectedSubject)}`);
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error('Failed to load admin assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedClass, selectedSubject]);

  return (
    <div className="module-view-container">
      <div className="module-controls-bar">
        <div>
          <h3>Coursework & Institutional Assignments</h3>
          <p className="subtitle">Track school-wide assignments, deadlines, submission rates, and evaluation metrics</p>
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
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Subjects</option>
            <option value="MTH-101">Mathematics</option>
            <option value="SCI-101">Science</option>
            <option value="ENG-101">English</option>
          </select>
        </div>
      </div>

      <div className="table-responsive card">
        {loading ? (
          <div className="module-loading">Loading assignments data...</div>
        ) : assignments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Subject & Code</th>
                <th>Target Class</th>
                <th>Faculty Instructor</th>
                <th>Deadline</th>
                <th>Submissions</th>
                <th>Graded Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const isOverdue = new Date() > new Date(a.deadline);
                const subCount = a.submissions?.length || 0;
                const gradedCount = a.submissions?.filter((s) => s.status === 'Graded').length || 0;

                return (
                  <tr key={a._id}>
                    <td>
                      <strong>{a.title}</strong>
                      {a.attachmentName && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📎 {a.attachmentName}</div>
                      )}
                    </td>
                    <td><span className="badge badge-teacher">{a.subjectName}</span></td>
                    <td><span className="badge badge-student">{a.className} - {a.section}</span></td>
                    <td>👨‍🏫 {a.teacherName}</td>
                    <td>
                      <span className={`deadline-pill ${isOverdue ? 'overdue' : 'active'}`}>
                        {new Date(a.deadline).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="credits-pill">{subCount} Submissions</span>
                    </td>
                    <td>
                      <strong style={{ color: '#10b981' }}>{gradedCount} / {subCount}</strong>
                    </td>
                    <td>
                      <span className={`status-pill status-${isOverdue ? 'pending' : 'active'}`}>
                        {isOverdue ? 'Closed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-table-msg">No assignments found matching filters.</div>
        )}
      </div>
    </div>
  );
};

// --- Exams Module (Phase 9 Enhanced) ---
export const ExamsModule = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExamForSchedule, setSelectedExamForSchedule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExamForm, setNewExamForm] = useState({
    name: 'Unit Test 2 (Assessment)',
    examType: 'Unit Test',
    academicSession: '2026-27',
    className: 'Class 10',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0],
    status: 'Upcoming',
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/academic/exams?examType=${encodeURIComponent(selectedType)}`);
      if (res.data.success) {
        setExams(res.data.exams);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedType]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academic/exams', newExamForm);
      if (res.data.success) {
        setShowCreateModal(false);
        fetchExams();
      }
    } catch (err) {
      alert('Failed to schedule exam');
    }
  };

  return (
    <div className="module-view-container">
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 CBSE Examinations & Assessment Schedules</h3>
          <p className="subtitle">Unit Tests, Half-Yearly, Pre-Board, and Annual Board Exam timetables</p>
        </div>

        <div className="search-filter-group">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Exam Types</option>
            <option value="Unit Test">Unit Tests</option>
            <option value="Half-Yearly">Half-Yearly Examination</option>
            <option value="Pre-Board">Pre-Board Examination</option>
            <option value="Annual Examination">Annual Examination</option>
          </select>

          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            + Schedule Examination
          </button>
        </div>
      </div>

      <div className="exams-grid">
        {loading ? (
          <div className="module-loading">Loading examination schedules...</div>
        ) : exams.length > 0 ? (
          exams.map((ex) => (
            <div key={ex._id} className="card exam-card">
              <div className="exam-card-header">
                <span className={`status-pill status-${ex.status === 'Results Published' ? 'approved' : ex.status === 'Ongoing' ? 'in-progress' : 'active'}`}>
                  {ex.status}
                </span>
                <span className="room-badge">{ex.className} • {ex.academicSession}</span>
              </div>
              <h3 className="exam-title">{ex.name}</h3>
              <div className="exam-dates">
                <span>📅 Starts: <strong>{new Date(ex.startDate).toLocaleDateString()}</strong></span>
                <span>🏁 Ends: <strong>{new Date(ex.endDate).toLocaleDateString()}</strong></span>
              </div>
              <div className="exam-card-footer">
                <button
                  onClick={() => setSelectedExamForSchedule(ex)}
                  className="btn btn-outline-primary btn-sm"
                >
                  🗓️ View Date Sheet ({ex.schedule?.length || 0} Papers)
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-table-msg">No examinations scheduled.</div>
        )}
      </div>

      {/* Date Sheet Timetable Modal */}
      {selectedExamForSchedule && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <div>
                <h3>🗓️ Exam Timetable: {selectedExamForSchedule.name}</h3>
                <p className="subtitle">
                  {selectedExamForSchedule.className} • Session {selectedExamForSchedule.academicSession}
                </p>
              </div>
              <button onClick={() => setSelectedExamForSchedule(null)} className="close-btn">&times;</button>
            </div>

            <div className="table-responsive">
              {selectedExamForSchedule.schedule && selectedExamForSchedule.schedule.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Subject & Code</th>
                      <th>Max Marks</th>
                      <th>Seating Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExamForSchedule.schedule.map((slot, sIdx) => (
                      <tr key={sIdx}>
                        <td><strong>{new Date(slot.date).toLocaleDateString()}</strong></td>
                        <td>⏰ {slot.startTime} - {slot.endTime}</td>
                        <td><strong>{slot.subjectName}</strong> <span className="code-pill">{slot.subjectCode}</span></td>
                        <td><strong>{slot.maxMarks} Marks</strong></td>
                        <td>🏫 {slot.roomNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-table-msg">Detailed date sheet is being finalized by Examination Controller.</div>
              )}
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedExamForSchedule(null)} className="btn btn-primary">
                Close Timetable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>+ Schedule New Examination</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleCreateExam} className="modal-form">
              <div className="form-group">
                <label>Examination Title *</label>
                <input
                  type="text"
                  required
                  value={newExamForm.name}
                  onChange={(e) => setNewExamForm({ ...newExamForm, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Exam Type *</label>
                  <select
                    value={newExamForm.examType}
                    onChange={(e) => setNewExamForm({ ...newExamForm, examType: e.target.value })}
                    className="form-control"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Half-Yearly">Half-Yearly Examination</option>
                    <option value="Pre-Board">Pre-Board Examination</option>
                    <option value="Annual Examination">Annual Examination</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Class *</label>
                  <select
                    value={newExamForm.className}
                    onChange={(e) => setNewExamForm({ ...newExamForm, className: e.target.value })}
                    className="form-control"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Class 9">Class 9</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Commencement Date *</label>
                  <input
                    type="date"
                    required
                    value={newExamForm.startDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, startDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Conclusion Date *</label>
                  <input
                    type="date"
                    required
                    value={newExamForm.endDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, endDate: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Results Module (Phase 9 Enhanced) ---
export const ResultsModule = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportCard, setSelectedReportCard] = useState(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/academic/results');
      if (res.data.success) {
        setResults(res.data.results);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div className="module-view-container">
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 CBSE Academic Results & Performance Marksheets</h3>
          <p className="subtitle">Class rank, marks obtained, percentage calculations, and official CBSE report cards</p>
        </div>
      </div>

      <div className="table-responsive card">
        {loading ? (
          <div className="module-loading">Loading verified marksheets...</div>
        ) : results.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Admission No</th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Class & Section</th>
                <th>Examination</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>CBSE Grade</th>
                <th>Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td><span className="leaderboard-rank">#{r.rankInClass || 1}</span></td>
                  <td><span className="code-pill">{r.admissionNumber}</span></td>
                  <td><strong>#{r.rollNumber}</strong></td>
                  <td><strong>{r.studentName}</strong></td>
                  <td><span className="badge badge-student">{r.className} - {r.section}</span></td>
                  <td><strong>{r.examName}</strong></td>
                  <td><strong>{r.totalMarksObtained} / {r.totalMaxMarks}</strong></td>
                  <td><strong style={{ color: '#10b981', fontSize: '1.05rem' }}>{r.percentage}%</strong></td>
                  <td><span className="badge badge-teacher" style={{ fontSize: '0.95rem' }}>{r.overallGrade}</span></td>
                  <td><span className="status-pill status-approved">{r.resultStatus}</span></td>
                  <td>
                    <button
                      onClick={() => setSelectedReportCard(r)}
                      className="btn btn-outline-primary btn-sm"
                    >
                      📄 Official Report Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-table-msg">No examination results published yet.</div>
        )}
      </div>

      {/* Official CBSE Report Card Modal */}
      {selectedReportCard && (
        <div className="modal-backdrop">
          <div className="modal-box report-card-modal-box" style={{ maxWidth: '850px' }}>
            <div className="report-card-container">
              {/* Institutional Header */}
              <div className="report-card-header">
                <div className="report-school-logo">🏛️</div>
                <div className="report-school-info">
                  <h2>School Management System</h2>
                  <p className="school-aff-text">Affiliated to CBSE, New Delhi (Affiliation No: 2130842 • School Code: CBSE-SCH-84210)</p>
                  <p className="school-addr-text">Plot 42, Institutional Area, Knowledge Park III, Greater Noida - 201306</p>
                  <div className="report-term-title">
                    ACADEMIC SESSION 2026-27 • OFFICIAL REPORT CARD ({selectedReportCard.examName})
                  </div>
                </div>
              </div>

              {/* Student Identity Ledger */}
              <div className="report-student-meta-grid">
                <div><span>Student Name:</span> <strong>{selectedReportCard.studentName}</strong></div>
                <div><span>Admission No:</span> <strong>{selectedReportCard.admissionNumber}</strong></div>
                <div><span>Roll Number:</span> <strong>#{selectedReportCard.rollNumber}</strong></div>
                <div><span>Class & Section:</span> <strong>{selectedReportCard.className} ({selectedReportCard.section})</strong></div>
                <div><span>Academic Term:</span> <strong>{selectedReportCard.examType}</strong></div>
                <div><span>Class Rank:</span> <strong style={{ color: '#4f46e5' }}>#{selectedReportCard.rankInClass}</strong></div>
              </div>

              {/* Subject Marks Breakdown Table */}
              <table className="report-card-table">
                <thead>
                  <tr>
                    <th>Subject Code & Name</th>
                    <th>Theory (/80)</th>
                    <th>Practical (/20)</th>
                    <th>Total Obtained</th>
                    <th>Max Marks</th>
                    <th>CBSE Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReportCard.subjectMarks && selectedReportCard.subjectMarks.map((subj, idx) => (
                    <tr key={idx}>
                      <td><strong>{subj.subjectName}</strong> <span className="code-pill">{subj.subjectCode}</span></td>
                      <td>{subj.theoryMarks || '—'}</td>
                      <td>{subj.practicalMarks || '—'}</td>
                      <td><strong>{subj.marksObtained}</strong></td>
                      <td>{subj.maxMarks}</td>
                      <td><span className="badge badge-teacher">{subj.grade}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Grand Summary Row */}
              <div className="report-grand-summary">
                <div className="summary-item">
                  <span>Grand Total:</span>
                  <strong>{selectedReportCard.totalMarksObtained} / {selectedReportCard.totalMaxMarks}</strong>
                </div>
                <div className="summary-item">
                  <span>Aggregate Percentage:</span>
                  <strong style={{ color: '#10b981' }}>{selectedReportCard.percentage}%</strong>
                </div>
                <div className="summary-item">
                  <span>Overall CBSE Grade:</span>
                  <strong style={{ color: '#4f46e5' }}>{selectedReportCard.overallGrade}</strong>
                </div>
                <div className="summary-item">
                  <span>Result Status:</span>
                  <span className="status-pill status-approved">{selectedReportCard.resultStatus}</span>
                </div>
              </div>

              {/* Remarks */}
              <div className="report-remarks-box">
                <strong>Class Teacher Remarks:</strong> {selectedReportCard.remarks || 'Outstanding academic performance.'}
              </div>

              {/* Signatures */}
              <div className="report-signatures-row">
                <div className="sig-block">
                  <div className="sig-line">Mrs. Neha Sharma</div>
                  <span>Class Teacher</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line">Exam Controller</div>
                  <span>Examination Cell</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line">Dr. Rajeshwar Prasad</div>
                  <span>Principal (Affiliated to CBSE)</span>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => window.print()} className="btn btn-outline-primary">
                🖨️ Print / Download Marksheet
              </button>
              <button onClick={() => setSelectedReportCard(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Timetable Module (Phase 11 Enhanced) ---
export const TimetableModule = () => {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/finance/timetable?className=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}`);
      if (res.data.success) {
        setTimetableData(res.data.timetable);
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass, selectedSection]);

  const daysList = timetableData?.days || [];
  const currentDaySchedule = daysList.find((d) => d.dayName === activeDay) || daysList[0];

  return (
    <div className="module-view-container">
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 Master Period-Wise Class Timetable</h3>
          <p className="subtitle">Standard Indian daily school schedule with period allocations, faculty, and room assignments</p>
        </div>

        <div className="search-filter-group">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-control module-select"
          >
            <option value="Class 10">Class 10</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="form-control module-select"
          >
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
          </select>

          <button onClick={() => window.print()} className="btn btn-outline-primary">
            🖨️ Print Timetable Sheet
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="assignment-subtabs-row" style={{ marginBottom: '1.25rem' }}>
        <div className="view-mode-toggle">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <button
              key={day}
              className={`toggle-btn ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(day)}
            >
              🗓️ {day}
            </button>
          ))}
        </div>
      </div>

      {/* Period Timeline Grid */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>{selectedClass} ({selectedSection}) — Daily Schedule ({activeDay})</h3>
            <p className="subtitle">Academic Session 2026-27 • School Timings: 08:00 AM to 12:00 PM</p>
          </div>
          <span className="badge badge-teacher">Session 2026-27</span>
        </div>

        <div className="table-responsive" style={{ marginTop: '1rem' }}>
          {loading ? (
            <div className="module-loading">Loading schedule...</div>
          ) : currentDaySchedule && currentDaySchedule.periods?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Time Slot</th>
                  <th>Subject & Code</th>
                  <th>Assigned Faculty</th>
                  <th>Classroom / Lab</th>
                </tr>
              </thead>
              <tbody>
                {currentDaySchedule.periods.map((slot, pIdx) => {
                  if (slot.isBreak) {
                    return (
                      <tr key={pIdx} style={{ backgroundColor: '#fef3c7', fontWeight: 600 }}>
                        <td><span className="code-pill">BREAK</span></td>
                        <td>⏰ {slot.startTime} - {slot.endTime}</td>
                        <td colSpan="3" style={{ color: '#b45309' }}>
                          🥪 Tiffin & Recreation Break (Cafeteria / School Grounds)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={pIdx}>
                      <td><span className="leaderboard-rank">#{slot.periodNumber}</span></td>
                      <td>⏰ <strong>{slot.startTime} - {slot.endTime}</strong></td>
                      <td>
                        <strong>{slot.subjectName}</strong>{' '}
                        {slot.subjectCode && <span className="code-pill">{slot.subjectCode}</span>}
                      </td>
                      <td>👨‍🏫 {slot.teacherName || 'Faculty'}</td>
                      <td>🏫 {slot.roomNumber}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-table-msg">No periods configured for this day.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Institutional Reports Module (Phase 11 Enhanced) ---
export const ReportsModule = () => {
  const [selectedReportType, setSelectedReportType] = useState('students');
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/finance/reports');
      if (res.data.success) {
        setReportsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load institutional reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const reports = reportsData?.reports || {};
  const schoolProfile = reportsData?.schoolProfile || {
    schoolName: 'School Management System',
    schoolCode: 'CBSE-SCH-84210',
    affiliation: 'Affiliated to CBSE, New Delhi (Affiliation No: 2130842)',
    academicSession: '2026-27',
    principalName: 'Dr. Rajeshwar Prasad (Ph.D, M.Ed)',
  };

  return (
    <div className="module-view-container">
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 Institutional Analytical Reports & Audit Engine</h3>
          <p className="subtitle">Consolidated academic, administrative, financial, and regulatory reports for CBSE compliance</p>
        </div>

        <button onClick={() => window.print()} className="btn btn-primary">
          🖨️ Print / Export Official Report
        </button>
      </div>

      {/* Report Categories Switcher */}
      <div className="assignment-subtabs-row" style={{ marginBottom: '1.25rem' }}>
        <div className="view-mode-toggle" style={{ flexWrap: 'wrap' }}>
          <button
            className={`toggle-btn ${selectedReportType === 'students' ? 'active' : ''}`}
            onClick={() => setSelectedReportType('students')}
          >
            🎓 Student Report ({reports.students?.totalStudents || 0})
          </button>
          <button
            className={`toggle-btn ${selectedReportType === 'attendance' ? 'active' : ''}`}
            onClick={() => setSelectedReportType('attendance')}
          >
            📅 Attendance Report ({reports.attendance?.overallAttendanceRate || '95%'})
          </button>
          <button
            className={`toggle-btn ${selectedReportType === 'results' ? 'active' : ''}`}
            onClick={() => setSelectedReportType('results')}
          >
            📊 CBSE Result Report ({reports.results?.passRate || '100%'} Pass)
          </button>
          <button
            className={`toggle-btn ${selectedReportType === 'fees' ? 'active' : ''}`}
            onClick={() => setSelectedReportType('fees')}
          >
            💰 Fee Collection Report (₹{reports.fees?.totalCollected?.toLocaleString('en-IN') || 0})
          </button>
          <button
            className={`toggle-btn ${selectedReportType === 'assignments' ? 'active' : ''}`}
            onClick={() => setSelectedReportType('assignments')}
          >
            📝 Assignment Report ({reports.assignments?.totalAssignments || 0})
          </button>
          <button
            className={`toggle-btn ${selectedReportType === 'complaints' ? 'active' : ''}`}
            onClick={() => setSelectedReportType('complaints')}
          >
            💬 Grievance Report ({reports.complaints?.resolvedComplaints || 0} Resolved)
          </button>
          <button
            className={`toggle-btn ${selectedReportType === 'leaves' ? 'active' : ''}`}
            onClick={() => setSelectedReportType('leaves')}
          >
            🏖️ Leave Report ({reports.leaves?.approvedLeaves || 0} Approved)
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="card">
        {/* Institutional Report Header */}
        <div className="report-card-header" style={{ paddingBottom: '1rem', borderBottom: '2px solid #0f172a' }}>
          <div className="report-school-logo">🏛️</div>
          <div className="report-school-info">
            <h2>{schoolProfile.schoolName}</h2>
            <p className="school-aff-text">{schoolProfile.affiliation} • School Code: {schoolProfile.schoolCode}</p>
            <div className="report-term-title">
              OFFICIAL INSTITUTIONAL REPORT • {selectedReportType.toUpperCase()} STATEMENT • SESSION 2026-27
            </div>
          </div>
        </div>

        {loading ? (
          <div className="module-loading">Generating analytical report data...</div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {/* 1. STUDENT REPORT */}
            {selectedReportType === 'students' && (
              <div>
                <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="admin-stat-card card-students">
                    <div className="stat-card-value">{reports.students?.totalStudents}</div>
                    <div className="stat-card-label">Enrolled Students</div>
                  </div>
                  <div className="admin-stat-card card-fees">
                    <div className="stat-card-value">100%</div>
                    <div className="stat-card-label">Aadhaar Verified</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Admission No</th>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Class & Section</th>
                        <th>Father & Mother</th>
                        <th>Parent Contact</th>
                        <th>City / State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.students?.data?.map((st) => (
                        <tr key={st._id}>
                          <td><span className="code-pill">{st.admissionNumber}</span></td>
                          <td><strong>#{st.rollNumber}</strong></td>
                          <td><strong>{st.name}</strong></td>
                          <td><span className="badge badge-student">{st.className} - {st.section}</span></td>
                          <td>{st.fatherName} & {st.motherName}</td>
                          <td>📞 {st.parentContact}</td>
                          <td>{st.city}, {st.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. ATTENDANCE REPORT */}
            {selectedReportType === 'attendance' && (
              <div>
                <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="admin-stat-card card-students">
                    <div className="stat-card-value" style={{ color: '#10b981' }}>{reports.attendance?.overallAttendanceRate}</div>
                    <div className="stat-card-label">Aggregate Attendance Rate</div>
                  </div>
                  <div className="admin-stat-card card-leaves">
                    <div className="stat-card-value">{reports.attendance?.totalSessions}</div>
                    <div className="stat-card-label">Recorded Class Sessions</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Session Date</th>
                        <th>Class & Section</th>
                        <th>Subject & Code</th>
                        <th>Faculty Marked</th>
                        <th>Enrolled Roster Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.attendance?.data?.map((att) => (
                        <tr key={att._id}>
                          <td><strong>{new Date(att.date).toLocaleDateString()}</strong></td>
                          <td><span className="badge badge-student">{att.className} - {att.section}</span></td>
                          <td><strong>{att.subjectName}</strong> <span className="code-pill">{att.subjectCode}</span></td>
                          <td>👨‍🏫 {att.markedBy}</td>
                          <td><strong>{att.records?.length || 0} Students</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. CBSE RESULT REPORT */}
            {selectedReportType === 'results' && (
              <div>
                <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="admin-stat-card card-students">
                    <div className="stat-card-value" style={{ color: '#10b981' }}>{reports.results?.passRate}</div>
                    <div className="stat-card-label">Institutional Pass Rate</div>
                  </div>
                  <div className="admin-stat-card card-fees">
                    <div className="stat-card-value">{reports.results?.averageScore}</div>
                    <div className="stat-card-label">Batch Average Score</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student Name</th>
                        <th>Admission No</th>
                        <th>Exam Term</th>
                        <th>Total Marks</th>
                        <th>Percentage</th>
                        <th>CBSE Grade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.results?.data?.map((res) => (
                        <tr key={res._id}>
                          <td><span className="leaderboard-rank">#{res.rankInClass || 1}</span></td>
                          <td><strong>{res.studentName}</strong></td>
                          <td><span className="code-pill">{res.admissionNumber}</span></td>
                          <td>{res.examName}</td>
                          <td><strong>{res.totalMarksObtained} / {res.totalMaxMarks}</strong></td>
                          <td><strong style={{ color: '#10b981' }}>{res.percentage}%</strong></td>
                          <td><span className="badge badge-teacher">{res.overallGrade}</span></td>
                          <td><span className="status-pill status-approved">{res.resultStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. FEE REPORT */}
            {selectedReportType === 'fees' && (
              <div>
                <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="admin-stat-card card-fees">
                    <div className="stat-card-value">₹{reports.fees?.totalBilled?.toLocaleString('en-IN')}</div>
                    <div className="stat-card-label">Total Fee Assessed</div>
                  </div>
                  <div className="admin-stat-card card-students">
                    <div className="stat-card-value" style={{ color: '#10b981' }}>
                      ₹{reports.fees?.totalCollected?.toLocaleString('en-IN')}
                    </div>
                    <div className="stat-card-label">Total Fee Collected ({reports.fees?.collectionRate})</div>
                  </div>
                  <div className="admin-stat-card card-leaves">
                    <div className="stat-card-value" style={{ color: '#ef4444' }}>
                      ₹{reports.fees?.totalDues?.toLocaleString('en-IN')}
                    </div>
                    <div className="stat-card-label">Outstanding Dues</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice No</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Total (₹)</th>
                        <th>Paid (₹)</th>
                        <th>Remaining (₹)</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.fees?.data?.map((fee) => (
                        <tr key={fee._id}>
                          <td><span className="code-pill">{fee.invoiceNumber}</span></td>
                          <td><strong>{fee.studentName}</strong></td>
                          <td>{fee.className}</td>
                          <td><strong>₹{fee.totalAmount?.toLocaleString('en-IN')}</strong></td>
                          <td><strong style={{ color: '#10b981' }}>₹{fee.paidAmount?.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <strong style={{ color: fee.remainingAmount > 0 ? '#ef4444' : '#10b981' }}>
                              ₹{fee.remainingAmount?.toLocaleString('en-IN')}
                            </strong>
                          </td>
                          <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-pill status-${fee.status === 'Paid' ? 'approved' : fee.status === 'Partial' ? 'in-progress' : 'danger'}`}>
                              {fee.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. ASSIGNMENT REPORT */}
            {selectedReportType === 'assignments' && (
              <div>
                <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="admin-stat-card card-students">
                    <div className="stat-card-value">{reports.assignments?.totalAssignments}</div>
                    <div className="stat-card-label">Coursework Published</div>
                  </div>
                  <div className="admin-stat-card card-fees">
                    <div className="stat-card-value">{reports.assignments?.totalSubmissions}</div>
                    <div className="stat-card-label">Student Submissions</div>
                  </div>
                  <div className="admin-stat-card card-leaves">
                    <div className="stat-card-value">{reports.assignments?.totalGraded}</div>
                    <div className="stat-card-label">Graded by Faculty</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Subject & Code</th>
                        <th>Class & Section</th>
                        <th>Instructor</th>
                        <th>Max Marks</th>
                        <th>Submissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.assignments?.data?.map((asg) => (
                        <tr key={asg._id}>
                          <td><strong>{asg.title}</strong></td>
                          <td>{asg.subjectName} <span className="code-pill">{asg.subjectCode}</span></td>
                          <td><span className="badge badge-student">{asg.className} - {asg.section}</span></td>
                          <td>👨‍🏫 {asg.teacherName}</td>
                          <td><strong>{asg.totalMarks} Marks</strong></td>
                          <td><span className="credits-pill">{asg.submissions?.length || 0} Turned In</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. COMPLAINT REPORT */}
            {selectedReportType === 'complaints' && (
              <div>
                <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="admin-stat-card card-leaves">
                    <div className="stat-card-value">{reports.complaints?.totalComplaints}</div>
                    <div className="stat-card-label">Total Grievances Filed</div>
                  </div>
                  <div className="admin-stat-card card-students">
                    <div className="stat-card-value" style={{ color: '#10b981' }}>{reports.complaints?.resolvedComplaints}</div>
                    <div className="stat-card-label">Redressed / Resolved</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Student</th>
                        <th>Category</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Resolved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.complaints?.data?.map((comp) => (
                        <tr key={comp._id}>
                          <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                          <td><strong>{comp.studentName}</strong></td>
                          <td><span className="category-pill">{comp.category}</span></td>
                          <td>{comp.subject}</td>
                          <td>
                            <span className={`status-pill status-${comp.status === 'Resolved' ? 'approved' : 'in-progress'}`}>
                              {comp.status}
                            </span>
                          </td>
                          <td>{comp.resolvedBy || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. LEAVE REPORT */}
            {selectedReportType === 'leaves' && (
              <div>
                <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="admin-stat-card card-leaves">
                    <div className="stat-card-value">{reports.leaves?.totalLeaves}</div>
                    <div className="stat-card-label">Leave Applications</div>
                  </div>
                  <div className="admin-stat-card card-students">
                    <div className="stat-card-value" style={{ color: '#10b981' }}>{reports.leaves?.approvedLeaves}</div>
                    <div className="stat-card-label">Sanctioned & Approved</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Role & Class</th>
                        <th>Leave Type</th>
                        <th>Duration</th>
                        <th>Days</th>
                        <th>Status</th>
                        <th>Sanctioned By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.leaves?.data?.map((lv) => (
                        <tr key={lv._id}>
                          <td><strong>{lv.applicantName}</strong></td>
                          <td><span className="badge badge-student">{lv.applicantRole}</span></td>
                          <td>{lv.leaveType}</td>
                          <td>{new Date(lv.startDate).toLocaleDateString()} to {new Date(lv.endDate).toLocaleDateString()}</td>
                          <td><span className="code-pill">{lv.totalDays} Days</span></td>
                          <td>
                            <span className={`status-pill status-${lv.status === 'Approved' ? 'approved' : 'danger'}`}>
                              {lv.status}
                            </span>
                          </td>
                          <td>{lv.reviewedBy || 'Office'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Official Endorsement Signatures */}
        <div className="report-signatures-row" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
          <div className="sig-block">
            <div className="sig-line">Audit Registrar</div>
            <span>Internal Compliance</span>
          </div>
          <div className="sig-block">
            <div className="sig-line">Dr. Rajeshwar Prasad</div>
            <span>Principal & Secretary (Affiliation No: 2130842)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Settings & School Profile Module (Phase 8 Enhanced) ---
export const SettingsModule = () => {
  const [profile, setProfile] = useState({
    schoolName: 'School Management System',
    schoolCode: 'CBSE-SCH-84210',
    affiliation: 'Affiliated to CBSE, New Delhi (Affiliation No: 2130842)',
    academicSession: '2026-27',
    principalName: 'Dr. Rajeshwar Prasad (Ph.D, M.Ed)',
    address: 'Plot 42, Institutional Area, Knowledge Park III',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    pincode: '201306',
    contactNumber: '+91 120 4567890',
    email: 'principal@delhipublicacademy.edu.in',
    website: 'www.delhipublicacademy.edu.in',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/school-profile');
        if (res.data.success && res.data.profile) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error('Failed to load school profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      const res = await api.put('/admin/school-profile', profile);
      if (res.data.success) {
        setProfile(res.data.profile);
        setSuccessMsg('✔ Indian School Profile and Session 2026-27 configuration updated successfully!');
      }
    } catch (err) {
      alert('Failed to update school settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-view-container">
      <div className="card settings-card" style={{ maxWidth: '800px' }}>
        <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <h3>🇮🇳 Institutional Identity & School Profile</h3>
          <p className="subtitle">Official CBSE/ICSE affiliation details, Principal credentials, and Academic Session</p>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {loading ? (
          <div className="module-loading">Loading configuration profile...</div>
        ) : (
          <form onSubmit={handleSaveProfile} className="modal-form">
            <div className="form-group">
              <label>School Name *</label>
              <input
                type="text"
                required
                value={profile.schoolName}
                onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>School Code *</label>
                <input
                  type="text"
                  required
                  value={profile.schoolCode}
                  onChange={(e) => setProfile({ ...profile, schoolCode: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group flex-1">
                <label>Academic Session *</label>
                <input
                  type="text"
                  required
                  value={profile.academicSession}
                  onChange={(e) => setProfile({ ...profile, academicSession: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Affiliation Details (CBSE / ICSE / State Board) *</label>
              <input
                type="text"
                required
                value={profile.affiliation}
                onChange={(e) => setProfile({ ...profile, affiliation: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Principal Name & Credentials *</label>
                <input
                  type="text"
                  required
                  value={profile.principalName}
                  onChange={(e) => setProfile({ ...profile, principalName: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group flex-1">
                <label>Official Helpline Contact (+91)</label>
                <input
                  type="text"
                  value={profile.contactNumber}
                  onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Campus Street Address *</label>
              <input
                type="text"
                required
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>City *</label>
                <input
                  type="text"
                  required
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group flex-1">
                <label>State *</label>
                <input
                  type="text"
                  required
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group flex-1">
                <label>Pincode *</label>
                <input
                  type="text"
                  required
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Official Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group flex-1">
                <label>Official Portal Website</label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
              {saving ? 'Saving Changes...' : '💾 Save Institutional Configuration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


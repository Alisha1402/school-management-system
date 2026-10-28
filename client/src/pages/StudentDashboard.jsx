import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'results' | 'finance' | 'communication' | 'attendance'

  // =========================================================
  // 1. ASSIGNMENTS STATE
  // =========================================================
  const [assignmentsData, setAssignmentsData] = useState(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentSubTab, setAssignmentSubTab] = useState('pending'); // 'pending' | 'completed'
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({
    fileName: 'Aarav_Sharma_Maths_Solution.pdf',
    fileUrl: 'https://school-cloud.storage/submissions/Aarav_Sharma_Solution.pdf',
    submissionText: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // 2. EXAM RESULTS & REPORT CARD STATE (PHASE 9)
  // =========================================================
  const [resultsData, setResultsData] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState(null);

  // =========================================================
  // 3. FEES & TIMETABLE STATE (PHASE 11)
  // =========================================================
  const [financeSubTab, setFinanceSubTab] = useState('fees'); // 'fees' | 'timetable'
  const [feesData, setFeesData] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [loadingFinance, setLoadingFinance] = useState(false);

  // =========================================================
  // 4. COMMUNICATION STATE (PHASE 10)
  // =========================================================
  const [commSubTab, setCommSubTab] = useState('notices'); // 'notices' | 'complaints' | 'leaves'
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loadingComm, setLoadingComm] = useState(false);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    subject: '',
    category: 'Academic',
    description: '',
  });

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Sick Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    reason: '',
  });

  // =========================================================
  // 5. ATTENDANCE STATE
  // =========================================================
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchSubject, setSearchSubject] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const res = await api.get('/assignments/my-assignments');
      if (res.data.success) {
        setAssignmentsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoadingResults(true);
      const res = await api.get('/academic/my-results');
      if (res.data.success) {
        setResultsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load exam results:', err);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchFinance = async () => {
    try {
      setLoadingFinance(true);
      const [fRes, tRes] = await Promise.all([
        api.get('/finance/my-fees'),
        api.get('/finance/timetable?className=Class 10&section=Section A'),
      ]);
      if (fRes.data.success) setFeesData(fRes.data);
      if (tRes.data.success) setTimetableData(tRes.data.timetable);
    } catch (err) {
      console.error('Failed to load student finance/timetable:', err);
    } finally {
      setLoadingFinance(false);
    }
  };

  const fetchCommunication = async () => {
    try {
      setLoadingComm(true);
      const [noticeRes, compRes, leaveRes] = await Promise.all([
        api.get('/communication/notices'),
        api.get('/communication/my-complaints'),
        api.get('/communication/my-leaves'),
      ]);
      if (noticeRes.data.success) setNotices(noticeRes.data.notices);
      if (compRes.data.success) setComplaints(compRes.data.complaints);
      if (leaveRes.data.success) setLeaves(leaveRes.data.leaves);
    } catch (err) {
      console.error('Failed to load student communications:', err);
    } finally {
      setLoadingComm(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const res = await api.get('/attendance/my-attendance');
      if (res.data.success) {
        setAttendanceData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchResults();
    fetchFinance();
    fetchCommunication();
    fetchAttendance();
  }, []);

  // Submit Homework Handler
  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!submittingAssignment) return;
    try {
      setSubmitting(true);
      const res = await api.post(`/assignments/${submittingAssignment._id}/submit`, submissionForm);
      if (res.data.success) {
        setShowSubmitModal(false);
        setSubmittingAssignment(null);
        setSubmissionForm({
          fileName: 'Aarav_Sharma_Solution.pdf',
          fileUrl: 'https://school-cloud.storage/submissions/Aarav_Sharma_Solution.pdf',
          submissionText: '',
        });
        fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting homework');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (assignment) => {
    setSubmittingAssignment(assignment);
    setSubmissionForm({
      fileName: `${user?.name || 'Student'}_${assignment.subjectCode}_Homework.pdf`,
      fileUrl: `https://school-cloud.storage/submissions/${user?.name || 'Student'}_Solution.pdf`,
      submissionText: '',
    });
    setShowSubmitModal(true);
  };

  // Submit Complaint Handler
  const handleFileComplaint = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communication/complaints', complaintForm);
      if (res.data.success) {
        setShowComplaintModal(false);
        setComplaintForm({ subject: '', category: 'Academic', description: '' });
        fetchCommunication();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit grievance');
    }
  };

  // Submit Leave Application Handler
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communication/leaves', leaveForm);
      if (res.data.success) {
        setShowLeaveModal(false);
        setLeaveForm({
          leaveType: 'Sick Leave',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
          reason: '',
        });
        fetchCommunication();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave application');
    }
  };

  const pendingList = assignmentsData?.pendingList || [];
  const completedList = assignmentsData?.completedList || [];
  const myResults = resultsData?.results || [];

  const stats = attendanceData?.stats || {
    overallPercentage: 98.4,
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    leaveCount: 0,
  };

  const history = attendanceData?.history || [];
  const todaySessions = attendanceData?.todaySessions || [];
  const monthlyBreakdown = attendanceData?.monthlyBreakdown || [];

  const myFeesList = feesData?.fees || [];
  const feeSummary = feesData?.summary || { totalBilled: 45000, totalPaid: 30000, totalDue: 15000 };

  const daysList = timetableData?.days || [];
  const currentDaySchedule = daysList.find((d) => d.dayName === activeDay) || daysList[0];

  const filteredHistory = history.filter((h) => {
    const matchesStatus = selectedStatusFilter === 'All' || h.status === selectedStatusFilter;
    const matchesSubject =
      h.subjectName.toLowerCase().includes(searchSubject.toLowerCase()) ||
      h.subjectCode.toLowerCase().includes(searchSubject.toLowerCase());
    return matchesStatus && matchesSubject;
  });

  return (
    <div className="dashboard-container">
      {/* 1. Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="portal-badge badge-student">🎒 Student Academic Portal • CBSE Session 2026-27</div>
          <h1>Student Academic Dashboard</h1>
          <p className="subtitle">
            Welcome back, <strong>{user?.name || 'Aarav Sharma'}</strong> (Admission No: <strong>{attendanceData?.student?.admissionNumber || 'ADM/2026/0101'}</strong> • Roll #{attendanceData?.student?.rollNumber || '101'}) • {attendanceData?.student?.className || 'Class 10 - Section A'}
          </p>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="faculty-portal-tabs">
          <button
            className={`portal-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            📝 Homework ({pendingList.length} Due)
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            📊 Results ({myResults.length})
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            💰 Fees & Schedule (Due: ₹{feeSummary.totalDue?.toLocaleString('en-IN')})
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'communication' ? 'active' : ''}`}
            onClick={() => setActiveTab('communication')}
          >
            📢 Notices & Helpdesk ({notices.length})
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            📅 Attendance ({stats.overallPercentage}%)
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: ASSIGNMENTS & HOMEWORK PORTAL (PHASE 7/8)
         ========================================================= */}
      {activeTab === 'assignments' && (
        <div>
          <div className="assignment-subtabs-row">
            <div className="view-mode-toggle">
              <button
                className={`toggle-btn ${assignmentSubTab === 'pending' ? 'active' : ''}`}
                onClick={() => setAssignmentSubTab('pending')}
              >
                ⏳ Pending Submissions ({pendingList.length})
              </button>
              <button
                className={`toggle-btn ${assignmentSubTab === 'completed' ? 'active' : ''}`}
                onClick={() => setAssignmentSubTab('completed')}
              >
                ✅ Completed & Graded ({completedList.length})
              </button>
            </div>
          </div>

          {loadingAssignments ? (
            <div className="module-loading">Loading homework assignments...</div>
          ) : assignmentSubTab === 'pending' ? (
            <div className="assignments-grid">
              {pendingList.length > 0 ? (
                pendingList.map((assignment) => {
                  const deadlineDate = new Date(assignment.deadline);
                  const isOverdue = new Date() > deadlineDate;

                  return (
                    <div key={assignment._id} className="card assignment-card student-assignment-card">
                      <div className="assignment-card-header">
                        <div>
                          <span className="badge badge-teacher">{assignment.subjectName}</span>
                          <h3 className="assignment-title">{assignment.title}</h3>
                          <span className="assignment-subject-sub">
                            Instructor: <strong>{assignment.teacherName}</strong> • {assignment.totalMarks} Max Marks
                          </span>
                        </div>

                        <span className={`deadline-pill ${isOverdue ? 'overdue' : 'active'}`}>
                          {isOverdue ? '🔴 Overdue' : '⏰ Due'} {deadlineDate.toLocaleDateString()}
                        </span>
                      </div>

                      <p className="assignment-desc">{assignment.description}</p>

                      {assignment.attachmentName && (
                        <div className="attachment-box">
                          <span>📎 Attached Problem Sheet:</span>
                          <a
                            href={assignment.attachmentUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="attachment-link"
                          >
                            📥 {assignment.attachmentName}
                          </a>
                        </div>
                      )}

                      <div className="assignment-card-actions">
                        <button
                          onClick={() => openSubmitModal(assignment)}
                          className="btn btn-primary btn-block"
                        >
                          📤 Submit Solution Deliverable
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-table-msg card">
                  🎉 Great job! You have no pending homework assignments due.
                </div>
              )}
            </div>
          ) : (
            <div className="assignments-grid">
              {completedList.length > 0 ? (
                completedList.map((assignment) => {
                  const sub = assignment.submission;
                  const isGraded = sub?.status === 'Graded';

                  return (
                    <div key={assignment._id} className="card assignment-card completed-assignment-card">
                      <div className="assignment-card-header">
                        <div>
                          <span className="badge badge-teacher">{assignment.subjectName}</span>
                          <h3 className="assignment-title">{assignment.title}</h3>
                          <span className="assignment-subject-sub">
                            Instructor: <strong>{assignment.teacherName}</strong>
                          </span>
                        </div>

                        <div>
                          {isGraded ? (
                            <span className="badge badge-teacher" style={{ fontSize: '0.95rem', padding: '0.35rem 0.65rem' }}>
                              ⭐ Score: <strong>{sub.marksObtained}</strong> / {assignment.totalMarks}
                            </span>
                          ) : (
                            <span className="badge badge-student">✔ Submitted • Awaiting Evaluation</span>
                          )}
                        </div>
                      </div>

                      <div className="submitted-work-summary">
                        <div className="submitted-meta-row">
                          <span>Turned in: {new Date(sub.submittedAt).toLocaleString()}</span>
                          {sub.fileName && (
                            <a
                              href={sub.fileUrl || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="attachment-link"
                            >
                              📄 {sub.fileName}
                            </a>
                          )}
                        </div>
                        <p className="submitted-text-quote">"{sub.submissionText}"</p>
                      </div>

                      {isGraded && (
                        <div className="feedback-display-box">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ color: '#166534' }}>💬 Faculty Remarks:</strong>
                            <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Evaluated by {sub.gradedBy || assignment.teacherName}</span>
                          </div>
                          <p style={{ color: '#14532d', fontSize: '0.9rem', margin: 0 }}>
                            {sub.feedback || 'Excellent problem derivation and structured methodology.'}
                          </p>
                        </div>
                      )}

                      <div className="assignment-card-actions" style={{ marginTop: '0.75rem' }}>
                        <button
                          onClick={() => openSubmitModal(assignment)}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          🔄 Re-submit Solution
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-table-msg card">
                  No submitted assignments yet. Complete pending assignments to see evaluation scores!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: EXAMINATION RESULTS & CBSE REPORT CARDS (PHASE 9)
         ========================================================= */}
      {activeTab === 'results' && (
        <div>
          {loadingResults ? (
            <div className="module-loading">Loading examination results...</div>
          ) : myResults.length > 0 ? (
            <div className="results-display-list">
              {myResults.map((result) => (
                <div key={result._id} className="card result-term-card">
                  <div className="result-card-header">
                    <div>
                      <span className="badge badge-teacher">{result.examType}</span>
                      <h2 style={{ fontSize: '1.35rem', margin: '0.35rem 0' }}>{result.examName}</h2>
                      <span className="subtitle">
                        Academic Session <strong>{result.academicSession}</strong> • Class <strong>{result.className} ({result.section})</strong>
                      </span>
                    </div>

                    <div className="result-overall-score-pill">
                      <div className="score-pct-badge">{result.percentage}%</div>
                      <span className="score-grade-sub">Grade: <strong>{result.overallGrade}</strong> • Rank #{result.rankInClass}</span>
                    </div>
                  </div>

                  <div className="table-responsive" style={{ marginTop: '1rem' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Subject Code & Name</th>
                          <th>Theory (/80)</th>
                          <th>Practical (/20)</th>
                          <th>Marks Obtained</th>
                          <th>Max Marks</th>
                          <th>CBSE Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.subjectMarks && result.subjectMarks.map((subj, idx) => (
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
                  </div>

                  <div className="result-card-footer">
                    <div className="result-summary-text">
                      <span>Total Marks: <strong>{result.totalMarksObtained} / {result.totalMaxMarks}</strong></span>
                      <span>Result: <strong style={{ color: '#10b981' }}>{result.resultStatus}</strong></span>
                      <span>Remarks: <em>{result.remarks}</em></span>
                    </div>

                    <button
                      onClick={() => setSelectedReportCard(result)}
                      className="btn btn-primary"
                    >
                      🖨️ View & Print Official CBSE Report Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-table-msg card">
              No examination marks cards published for your profile yet.
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: FEES & TIMETABLE (PHASE 11)
         ========================================================= */}
      {activeTab === 'finance' && (
        <div>
          {/* Sub-Tabs Switcher */}
          <div className="assignment-subtabs-row">
            <div className="view-mode-toggle">
              <button
                className={`toggle-btn ${financeSubTab === 'fees' ? 'active' : ''}`}
                onClick={() => setFinanceSubTab('fees')}
              >
                💰 Fee Ledger & Invoices
              </button>
              <button
                className={`toggle-btn ${financeSubTab === 'timetable' ? 'active' : ''}`}
                onClick={() => setFinanceSubTab('timetable')}
              >
                🗓️ Daily Period-Wise Timetable
              </button>
            </div>
          </div>

          {loadingFinance ? (
            <div className="module-loading">Loading financial ledger and timetable...</div>
          ) : financeSubTab === 'fees' ? (
            /* Sub-Tab 1: Fee Ledger */
            <div>
              {/* Stat Metric Cards */}
              <div className="stats-cards-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="admin-stat-card card-fees">
                  <div className="stat-card-value">₹{feeSummary.totalBilled?.toLocaleString('en-IN')}</div>
                  <div className="stat-card-label">Total Fee Assessed</div>
                  <div className="stat-card-sub">Session 2026-27 Composite Assessment</div>
                </div>
                <div className="admin-stat-card card-students">
                  <div className="stat-card-value" style={{ color: '#10b981' }}>
                    ₹{feeSummary.totalPaid?.toLocaleString('en-IN')}
                  </div>
                  <div className="stat-card-label">Amount Paid</div>
                  <div className="stat-card-sub">Settled via UPI / Net Banking</div>
                </div>
                <div className="admin-stat-card card-leaves">
                  <div className="stat-card-value" style={{ color: feeSummary.totalDue > 0 ? '#ef4444' : '#10b981' }}>
                    ₹{feeSummary.totalDue?.toLocaleString('en-IN')}
                  </div>
                  <div className="stat-card-label">Remaining Balance Due</div>
                  <div className="stat-card-sub">Due Date: 15 Sept 2026</div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="results-display-list">
                {myFeesList.map((fee) => (
                  <div key={fee._id} className="card result-term-card" style={{ borderTop: '4px solid #10b981' }}>
                    <div className="result-card-header">
                      <div>
                        <span className={`status-pill status-${fee.status === 'Paid' ? 'approved' : fee.status === 'Partial' ? 'in-progress' : 'danger'}`}>
                          {fee.status}
                        </span>
                        <h2 style={{ fontSize: '1.35rem', margin: '0.35rem 0' }}>{fee.title}</h2>
                        <span className="subtitle">
                          Invoice No: <strong>{fee.invoiceNumber}</strong> • Due Date: <strong>{new Date(fee.dueDate).toLocaleDateString()}</strong>
                        </span>
                      </div>

                      <div className="result-overall-score-pill">
                        <div className="score-pct-badge" style={{ color: fee.remainingAmount > 0 ? '#ef4444' : '#10b981' }}>
                          ₹{fee.remainingAmount?.toLocaleString('en-IN')}
                        </div>
                        <span className="score-grade-sub">Remaining Balance Due</span>
                      </div>
                    </div>

                    {/* Itemized Fee Breakdown Table */}
                    <div className="table-responsive" style={{ marginTop: '1rem' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Fee Component</th>
                            <th>Description</th>
                            <th>Assessed Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fee.feeBreakdown && fee.feeBreakdown.map((item, idx) => (
                            <tr key={idx}>
                              <td><strong>{item.head}</strong></td>
                              <td>Tuition, Laboratory, and Term Examination Operations</td>
                              <td><strong>₹{item.amount?.toLocaleString('en-IN')}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="result-card-footer">
                      <div className="result-summary-text">
                        <span>Total: <strong>₹{fee.totalAmount?.toLocaleString('en-IN')}</strong></span>
                        <span>Paid: <strong style={{ color: '#10b981' }}>₹{fee.paidAmount?.toLocaleString('en-IN')}</strong></span>
                        <span>Due: <strong style={{ color: '#ef4444' }}>₹{fee.remainingAmount?.toLocaleString('en-IN')}</strong></span>
                      </div>

                      <button
                        onClick={() => setSelectedFeeForReceipt(fee)}
                        className="btn btn-primary"
                      >
                        📄 View & Print Official Fee Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Sub-Tab 2: Period-wise Timetable */
            <div>
              {/* Day Selector */}
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

              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>Daily Class Schedule — {activeDay}</h3>
                    <p className="subtitle">School Hours: 08:00 AM to 12:00 PM • Class 10 (Section A)</p>
                  </div>
                  <span className="badge badge-teacher">Session 2026-27</span>
                </div>

                <div className="table-responsive" style={{ marginTop: '1rem' }}>
                  {currentDaySchedule && currentDaySchedule.periods?.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Time Slot</th>
                          <th>Subject & Code</th>
                          <th>Teacher</th>
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
                                  🥪 Tiffin Break (Cafeteria / School Grounds)
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
                    <div className="empty-table-msg">No classes scheduled.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 4: NOTICES, COMPLAINTS & LEAVES (PHASE 10)
         ========================================================= */}
      {activeTab === 'communication' && (
        <div>
          <div className="assignment-subtabs-row">
            <div className="view-mode-toggle">
              <button
                className={`toggle-btn ${commSubTab === 'notices' ? 'active' : ''}`}
                onClick={() => setCommSubTab('notices')}
              >
                📌 Circulars & Notices ({notices.length})
              </button>
              <button
                className={`toggle-btn ${commSubTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setCommSubTab('complaints')}
              >
                💬 Grievances & Helpdesk ({complaints.length})
              </button>
              <button
                className={`toggle-btn ${commSubTab === 'leaves' ? 'active' : ''}`}
                onClick={() => setCommSubTab('leaves')}
              >
                🏖️ Leave Applications ({leaves.length})
              </button>
            </div>
          </div>

          {loadingComm ? (
            <div className="module-loading">Loading school communication...</div>
          ) : commSubTab === 'notices' ? (
            <div className="notices-grid">
              {notices.length > 0 ? (
                notices.map((n) => (
                  <div key={n._id} className="card notice-card">
                    <div className="notice-card-header">
                      <div className="notice-meta-tags">
                        <span className="badge badge-teacher">{n.category || 'Important Announcement'}</span>
                        <span className={`priority-pill priority-${(n.priority || 'medium').toLowerCase()}`}>
                          {n.priority}
                        </span>
                        <span className="audience-pill">{n.audience}</span>
                      </div>
                    </div>

                    <h3 className="notice-title">{n.title}</h3>
                    <p className="notice-content">{n.content}</p>

                    <div className="notice-footer">
                      <span>✍️ Issued by: <strong>{n.postedBy || 'Principal'}</strong></span>
                      <span>📅 {new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-table-msg card">No notices published at this moment.</div>
              )}
            </div>
          ) : commSubTab === 'complaints' ? (
            <div>
              <div className="module-controls-bar">
                <div>
                  <h3>Student Grievance & Academic Queries Desk</h3>
                  <p className="subtitle">Submit questions or difficulties regarding academics, facilities, or schedule</p>
                </div>
                <button onClick={() => setShowComplaintModal(true)} className="btn btn-primary">
                  + File New Grievance / Query
                </button>
              </div>

              <div className="complaints-list">
                {complaints.length > 0 ? (
                  complaints.map((c) => (
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
                            <strong style={{ color: '#166534' }}>✔ Official Faculty/Admin Response:</strong>
                            <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Responded by {c.resolvedBy}</span>
                          </div>
                          <p style={{ margin: 0, color: '#14532d', fontSize: '0.9rem' }}>{c.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-table-msg card">You have not submitted any grievances.</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="module-controls-bar">
                <div>
                  <h3>Student Leave Applications</h3>
                  <p className="subtitle">Submit absence requests for medical, sick, or personal reasons</p>
                </div>
                <button onClick={() => setShowLeaveModal(true)} className="btn btn-primary">
                  + Apply for Leave
                </button>
              </div>

              <div className="table-responsive card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Duration (From - To)</th>
                      <th>Total Days</th>
                      <th>Reason</th>
                      <th>Decision Status</th>
                      <th>Class Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.length > 0 ? (
                      leaves.map((l) => (
                        <tr key={l._id}>
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
                            {l.adminRemark ? (
                              <span><em>"{l.adminRemark}"</em> (By {l.reviewedBy || 'Teacher'})</span>
                            ) : (
                              <span style={{ color: '#64748b' }}>Awaiting decision</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-table-msg">
                          No leave applications submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 5: ATTENDANCE ANALYTICS (PHASE 6/8)
         ========================================================= */}
      {activeTab === 'attendance' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3 style={{ color: '#4f46e5' }}>{stats.overallPercentage}%</h3>
                <p>Overall Attendance Rate</p>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <h3 style={{ color: '#10b981' }}>{stats.presentCount}</h3>
                <p>Present Periods</p>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="stat-icon">🔴</div>
              <div className="stat-info">
                <h3 style={{ color: '#ef4444' }}>{stats.absentCount}</h3>
                <p>Absent Periods</p>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="stat-icon">🟡</div>
              <div className="stat-info">
                <h3 style={{ color: '#f59e0b' }}>{stats.lateCount}</h3>
                <p>Late Arrivals</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>📅 Today's Scheduled Class Periods</h3>
                <p className="subtitle">Real-time period attendance status</p>
              </div>
              <span className="badge badge-student">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {todaySessions.length > 0 ? (
              <div className="today-subjects-grid">
                {todaySessions.map((session, idx) => (
                  <div key={idx} className="today-session-card">
                    <div className="today-session-header">
                      <strong>{session.subjectName}</strong>
                      <span className="code-pill">{session.subjectCode}</span>
                    </div>
                    <div className="today-session-meta">
                      <span>Faculty: {session.markedBy}</span>
                      <span className={`status-pill status-${session.status.toLowerCase()}`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="today-empty-banner">
                <span>✨ All classroom periods marked in session.</span>
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3>📊 Monthly Performance Consistency</h3>
              <p className="subtitle">Term-wise percentage of attendance</p>
            </div>

            <div className="monthly-attendance-grid">
              {monthlyBreakdown.map((m, idx) => (
                <div key={idx} className="monthly-tile">
                  <span className="monthly-name">{m.month}</span>
                  <span className="monthly-percentage">{m.percentage}%</span>
                  <div className="monthly-mini-bar">
                    <div className="monthly-bar-fill" style={{ width: `${m.percentage}%` }}></div>
                  </div>
                  <span className="monthly-details">{m.present}/{m.total} Periods</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="module-controls-bar" style={{ padding: '0 0 1rem 0' }}>
              <div>
                <h3>🕒 Chronological Attendance Ledger</h3>
                <p className="subtitle">History of recorded periods and faculty remarks</p>
              </div>

              <div className="search-filter-group">
                <input
                  type="text"
                  placeholder="🔍 Search subject..."
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  className="form-control module-search-input"
                />

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="form-control module-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">🟢 Present</option>
                  <option value="Absent">🔴 Absent</option>
                  <option value="Late">🟡 Late</option>
                  <option value="Leave">🟣 Leave</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              {loadingAttendance ? (
                <div className="module-loading">Loading records...</div>
              ) : filteredHistory.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject & Code</th>
                      <th>Class & Section</th>
                      <th>Class Teacher / Faculty</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{new Date(item.date).toLocaleDateString()}</strong></td>
                        <td><strong>{item.subjectName}</strong> <span className="code-pill">{item.subjectCode}</span></td>
                        <td><span className="badge badge-student">{item.className} - {item.section}</span></td>
                        <td>👨‍🏫 {item.markedBy}</td>
                        <td>
                          <span className={`status-pill status-${item.status.toLowerCase()}`}>
                            {item.status === 'Present' && '🟢 '}
                            {item.status === 'Absent' && '🔴 '}
                            {item.status === 'Late' && '🟡 '}
                            {item.status === 'Leave' && '🟣 '}
                            {item.status}
                          </span>
                        </td>
                        <td><span className="text-muted" style={{ fontSize: '0.825rem' }}>{item.remark || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-table-msg">No attendance entries found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          6. SUBMIT HOMEWORK MODAL
         ========================================================= */}
      {showSubmitModal && submittingAssignment && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <div>
                <h3>📤 Submit Homework Solution</h3>
                <p className="subtitle">
                  {submittingAssignment.title} • {submittingAssignment.subjectName} (
                  <strong>{submittingAssignment.totalMarks} Max Marks</strong>)
                </p>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmitHomework} className="modal-form">
              <div className="form-group">
                <label>Solution Notes & Derivations *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Explain your approach, answer summary, or solution derivations..."
                  value={submissionForm.submissionText}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, submissionText: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Deliverable File Name</label>
                  <input
                    type="text"
                    required
                    value={submissionForm.fileName}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, fileName: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Document Cloud Link</label>
                  <input
                    type="text"
                    required
                    value={submissionForm.fileUrl}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, fileUrl: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : '🚀 Submit Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          7. FILE COMPLAINT / QUERY MODAL (PHASE 10)
         ========================================================= */}
      {showComplaintModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>💬 Submit Academic Grievance or Query</h3>
              <button onClick={() => setShowComplaintModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleFileComplaint} className="modal-form">
              <div className="form-group">
                <label>Subject / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for Mathematics Doubt Clearing Session"
                  value={complaintForm.subject}
                  onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  className="form-control"
                >
                  <option value="Academic">Academic</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Transport">Transport</option>
                  <option value="Fee/Accounts">Fee/Accounts</option>
                  <option value="Discipline">Discipline</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label>Detailed Grievance Description *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your query or difficulty clearly for faculty review..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowComplaintModal(false)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          8. APPLY FOR LEAVE MODAL (PHASE 10)
         ========================================================= */}
      {showLeaveModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>🏖️ Apply for Student Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleApplyLeave} className="modal-form">
              <div className="form-group">
                <label>Leave Category *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="form-control"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Family Emergency">Family Emergency</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Leave *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide brief reason..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          9. OFFICIAL CBSE REPORT CARD MODAL (STUDENT VIEW)
         ========================================================= */}
      {selectedReportCard && (
        <div className="modal-backdrop">
          <div className="modal-box report-card-modal-box" style={{ maxWidth: '850px' }}>
            <div className="report-card-container">
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

              <div className="report-student-meta-grid">
                <div><span>Student Name:</span> <strong>{selectedReportCard.studentName}</strong></div>
                <div><span>Admission No:</span> <strong>{selectedReportCard.admissionNumber}</strong></div>
                <div><span>Roll Number:</span> <strong>#{selectedReportCard.rollNumber}</strong></div>
                <div><span>Class & Section:</span> <strong>{selectedReportCard.className} ({selectedReportCard.section})</strong></div>
                <div><span>Academic Term:</span> <strong>{selectedReportCard.examType}</strong></div>
                <div><span>Class Rank:</span> <strong style={{ color: '#4f46e5' }}>#{selectedReportCard.rankInClass}</strong></div>
              </div>

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

              <div className="report-remarks-box">
                <strong>Class Teacher Remarks:</strong> {selectedReportCard.remarks || 'Outstanding academic performance.'}
              </div>

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
                🖨️ Print / Download Report Card
              </button>
              <button onClick={() => setSelectedReportCard(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          10. OFFICIAL FEE RECEIPT CERTIFICATE MODAL (STUDENT VIEW)
         ========================================================= */}
      {selectedFeeForReceipt && (
        <div className="modal-backdrop">
          <div className="modal-box report-card-modal-box" style={{ maxWidth: '800px' }}>
            <div className="report-card-container">
              <div className="report-card-header">
                <div className="report-school-logo">🏛️</div>
                <div className="report-school-info">
                  <h2>School Management System</h2>
                  <p className="school-aff-text">CBSE Affiliation No: 2130842 • School Code: CBSE-SCH-84210</p>
                  <p className="school-addr-text">Plot 42, Institutional Area, Knowledge Park III, Greater Noida - 201306</p>
                  <div className="report-term-title">
                    OFFICIAL FEE PAYMENT RECEIPT • SESSION 2026-27
                  </div>
                </div>
              </div>

              <div className="report-student-meta-grid">
                <div><span>Receipt No:</span> <strong>{selectedFeeForReceipt.invoiceNumber}</strong></div>
                <div><span>Student Name:</span> <strong>{selectedFeeForReceipt.studentName}</strong></div>
                <div><span>Admission No:</span> <strong>{selectedFeeForReceipt.admissionNumber}</strong></div>
                <div><span>Class & Section:</span> <strong>{selectedFeeForReceipt.className}</strong></div>
                <div><span>Academic Term:</span> <strong>Annual Session 2026-27</strong></div>
                <div><span>Payment Status:</span> <strong style={{ color: selectedFeeForReceipt.status === 'Paid' ? '#10b981' : '#f59e0b' }}>{selectedFeeForReceipt.status}</strong></div>
              </div>

              <table className="report-card-table">
                <thead>
                  <tr>
                    <th>Fee Component</th>
                    <th>Assessment Head</th>
                    <th>Payable Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFeeForReceipt.feeBreakdown && selectedFeeForReceipt.feeBreakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.head}</strong></td>
                      <td>Tuition & Curriculum Operations</td>
                      <td><strong>₹{item.amount?.toLocaleString('en-IN')}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="report-grand-summary">
                <div className="summary-item">
                  <span>Total Fee Assessed:</span>
                  <strong>₹{selectedFeeForReceipt.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div className="summary-item">
                  <span>Amount Realized:</span>
                  <strong style={{ color: '#10b981' }}>₹{selectedFeeForReceipt.paidAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div className="summary-item">
                  <span>Remaining Due:</span>
                  <strong style={{ color: selectedFeeForReceipt.remainingAmount > 0 ? '#ef4444' : '#10b981' }}>
                    ₹{selectedFeeForReceipt.remainingAmount?.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Installment Due Date:</span>
                  <strong>{new Date(selectedFeeForReceipt.dueDate).toLocaleDateString()}</strong>
                </div>
              </div>

              {selectedFeeForReceipt.transactions && selectedFeeForReceipt.transactions.length > 0 && (
                <div style={{ margin: '1rem 0', fontSize: '0.85rem' }}>
                  <strong>Transaction History:</strong>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', color: '#475569' }}>
                    {selectedFeeForReceipt.transactions.map((tx, tIdx) => (
                      <li key={tIdx}>
                        Paid <strong>₹{tx.amount?.toLocaleString('en-IN')}</strong> via <strong>{tx.paymentMethod}</strong> (Ref: {tx.transactionRef}) on {new Date(tx.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="report-signatures-row">
                <div className="sig-block">
                  <div className="sig-line">Accounts Officer</div>
                  <span>Authorized Cashier</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line">Dr. Rajeshwar Prasad</div>
                  <span>Principal</span>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => window.print()} className="btn btn-outline-primary">
                🖨️ Print / Download Official Receipt
              </button>
              <button onClick={() => setSelectedFeeForReceipt(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

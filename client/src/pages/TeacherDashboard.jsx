import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'grading' | 'attendance' | 'communication'

  // =========================================================
  // 1. ATTENDANCE STATE
  // =========================================================
  const [classesList, setClassesList] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('MTH-101');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [attendanceFeedback, setAttendanceFeedback] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // =========================================================
  // 2. ASSIGNMENTS STATE
  // =========================================================
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form for Creating / Editing Assignment
  const initialAssignmentForm = {
    title: '',
    description: '',
    className: 'Class 10',
    section: 'Section A',
    subjectName: 'Mathematics',
    subjectCode: 'MTH-101',
    deadline: '',
    totalMarks: 20,
    attachmentName: '',
    attachmentUrl: '',
  };
  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);

  // Form for Grading a Student Submission
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // =========================================================
  // 3. CBSE EXAM MARKS ENTRY STATE (PHASE 9)
  // =========================================================
  const [studentsList, setStudentsList] = useState([]);
  const [examsList, setExamsList] = useState([]);
  const [selectedExamName, setSelectedExamName] = useState('Half-Yearly Examination 2026');
  const [selectedExamType, setSelectedExamType] = useState('Half-Yearly');
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState(null);
  const [subjectMarksForm, setSubjectMarksForm] = useState([
    { subjectName: 'Hindi', subjectCode: 'HIN-101', theoryMarks: 70, practicalMarks: 20, maxMarks: 100 },
    { subjectName: 'English', subjectCode: 'ENG-101', theoryMarks: 72, practicalMarks: 20, maxMarks: 100 },
    { subjectName: 'Mathematics', subjectCode: 'MTH-101', theoryMarks: 75, practicalMarks: 20, maxMarks: 100 },
    { subjectName: 'Science', subjectCode: 'SCI-101', theoryMarks: 70, practicalMarks: 20, maxMarks: 100 },
    { subjectName: 'Social Science', subjectCode: 'SST-101', theoryMarks: 70, practicalMarks: 20, maxMarks: 100 },
    { subjectName: 'Computer', subjectCode: 'CS-101', theoryMarks: 60, practicalMarks: 30, maxMarks: 100 },
  ]);
  const [teacherRemarks, setTeacherRemarks] = useState('Very good conceptual clarity and sincere class participation.');
  const [savingExamResult, setSavingExamResult] = useState(false);
  const [gradingFeedback, setGradingFeedback] = useState(null);

  // =========================================================
  // 4. COMMUNICATION & LEAVES STATE (PHASE 10)
  // =========================================================
  const [commSubTab, setCommSubTab] = useState('leaves'); // 'leaves' | 'notices' | 'complaints'
  const [notices, setNotices] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [showTeacherNoticeModal, setShowTeacherNoticeModal] = useState(false);
  const [newNoticeForm, setNewNoticeForm] = useState({
    title: '',
    content: '',
    category: 'Important Announcement',
    audience: 'Students',
    priority: 'High',
  });
  const [selectedComplaintToRespond, setSelectedComplaintToRespond] = useState(null);
  const [teacherResponseText, setTeacherResponseText] = useState('');

  // ---------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------
  const fetchClasses = async () => {
    try {
      const res = await api.get('/admin/classes');
      if (res.data.success && res.data.classes.length > 0) {
        setClassesList(res.data.classes);
        const first = res.data.classes[0];
        setSelectedClassName(first.name);
        setSelectedSection(first.section);
      }
    } catch (err) {
      console.error('Failed to load classes for teacher:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchStudentsAndExams = async () => {
    try {
      const [stuRes, examRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/academic/exams'),
      ]);
      if (stuRes.data.success) setStudentsList(stuRes.data.students);
      if (examRes.data.success && examRes.data.exams.length > 0) {
        setExamsList(examRes.data.exams);
        setSelectedExamName(examRes.data.exams[0].name);
        setSelectedExamType(examRes.data.exams[0].examType);
      }
    } catch (err) {
      console.error('Failed to load students and exams for grading:', err);
    }
  };

  const fetchCommunicationData = async () => {
    try {
      const [nRes, lRes, cRes] = await Promise.all([
        api.get('/communication/notices'),
        api.get('/communication/leaves'),
        api.get('/communication/complaints'),
      ]);
      if (nRes.data.success) setNotices(nRes.data.notices);
      if (lRes.data.success) setLeavesList(lRes.data.leaves);
      if (cRes.data.success) setComplaintsList(cRes.data.complaints);
    } catch (err) {
      console.error('Failed to load communication records:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAssignments();
    fetchStudentsAndExams();
    fetchCommunicationData();
  }, []);

  // Update available subjects when class changes
  useEffect(() => {
    const currentClass = classesList.find(
      (c) => c.name === selectedClassName && c.section === selectedSection
    );
    if (currentClass && currentClass.subjects && currentClass.subjects.length > 0) {
      setAvailableSubjects(currentClass.subjects);
      setSelectedSubject(currentClass.subjects[0].subjectName);
      setSelectedSubjectCode(currentClass.subjects[0].subjectCode);
    } else {
      setAvailableSubjects([
        { subjectName: 'Hindi', subjectCode: 'HIN-101' },
        { subjectName: 'English', subjectCode: 'ENG-101' },
        { subjectName: 'Mathematics', subjectCode: 'MTH-101' },
        { subjectName: 'Science', subjectCode: 'SCI-101' },
        { subjectName: 'Social Science', subjectCode: 'SST-101' },
        { subjectName: 'Computer', subjectCode: 'CS-101' },
      ]);
      setSelectedSubject('Mathematics');
      setSelectedSubjectCode('MTH-101');
    }
  }, [selectedClassName, selectedSection, classesList]);

  // Fetch Attendance Session
  const fetchSessionRoster = async () => {
    try {
      setLoadingRoster(true);
      setAttendanceFeedback(null);
      const res = await api.get(
        `/attendance/session?date=${selectedDate}&className=${encodeURIComponent(
          selectedClassName
        )}&section=${encodeURIComponent(selectedSection)}&subjectCode=${encodeURIComponent(
          selectedSubjectCode
        )}`
      );

      if (res.data.success) {
        setRoster(res.data.records || []);
        setAlreadyMarked(res.data.alreadyMarked);
      }
    } catch (err) {
      console.error('Failed to load session roster:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    if (selectedClassName && selectedSection && selectedSubjectCode && selectedDate) {
      fetchSessionRoster();
    }
  }, [selectedClassName, selectedSection, selectedSubjectCode, selectedDate]);

  // Attendance Handlers
  const handleSetStudentStatus = (index, status) => {
    const updated = [...roster];
    updated[index].status = status;
    setRoster(updated);
  };

  const handleSetStudentRemark = (index, remark) => {
    const updated = [...roster];
    updated[index].remark = remark;
    setRoster(updated);
  };

  const handleMarkAll = (status) => {
    const updated = roster.map((r) => ({ ...r, status }));
    setRoster(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAttendance(true);
      setAttendanceFeedback(null);
      const res = await api.post('/attendance', {
        date: selectedDate,
        className: selectedClassName,
        section: selectedSection,
        subjectName: selectedSubject,
        subjectCode: selectedSubjectCode,
        records: roster,
      });

      if (res.data.success) {
        setAlreadyMarked(true);
        setAttendanceFeedback({
          type: 'success',
          text: `✔ Attendance successfully recorded for ${selectedClassName} - ${selectedSection} (${selectedSubject}) on ${selectedDate}!`,
        });
      }
    } catch (err) {
      setAttendanceFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save attendance.',
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  // ---------------------------------------------------------
  // Assignment Handlers
  // ---------------------------------------------------------
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/assignments', {
        ...assignmentForm,
        teacherName: user?.name || 'Mrs. Neha Sharma',
      });
      if (res.data.success) {
        setShowCreateAssignmentModal(false);
        setAssignmentForm(initialAssignmentForm);
        fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating assignment');
    }
  };

  const handleEditAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/assignments/${assignmentForm._id}`, assignmentForm);
      if (res.data.success) {
        setShowEditAssignmentModal(false);
        fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment and all student submissions?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      alert('Failed to delete assignment');
    }
  };

  const openSubmissionsModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    setGradingSubmissionId(null);
  };

  const openEditModal = (assignment) => {
    setAssignmentForm({
      ...assignment,
      deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().split('T')[0] : '',
    });
    setShowEditAssignmentModal(true);
  };

  const handleSaveGrade = async (submissionId) => {
    try {
      const res = await api.patch(
        `/assignments/${selectedAssignment._id}/submissions/${submissionId}/grade`,
        {
          marksObtained: marksInput,
          feedback: feedbackInput,
        }
      );
      if (res.data.success) {
        setSelectedAssignment(res.data.assignment);
        setGradingSubmissionId(null);
        setMarksInput('');
        setFeedbackInput('');
        fetchAssignments();
      }
    } catch (err) {
      alert('Failed to save grade and feedback');
    }
  };

  // ---------------------------------------------------------
  // CBSE Exam Marks Entry & Grading Handlers (Phase 9)
  // ---------------------------------------------------------
  const handleOpenMarksEntry = (student) => {
    setSelectedStudentForGrading(student);
    setGradingFeedback(null);
  };

  const handleSubjectMarkChange = (idx, field, value) => {
    const updated = [...subjectMarksForm];
    updated[idx][field] = Number(value);
    setSubjectMarksForm(updated);
  };

  const handlePublishMarksheet = async (e) => {
    e.preventDefault();
    if (!selectedStudentForGrading) return;
    try {
      setSavingExamResult(true);
      setGradingFeedback(null);

      const payload = {
        studentId: selectedStudentForGrading._id,
        studentName: selectedStudentForGrading.name,
        admissionNumber: selectedStudentForGrading.admissionNumber,
        rollNumber: selectedStudentForGrading.rollNumber,
        className: selectedStudentForGrading.className,
        section: selectedStudentForGrading.section,
        academicSession: '2026-27',
        examName: selectedExamName,
        examType: selectedExamType,
        subjectMarks: subjectMarksForm,
        remarks: teacherRemarks,
      };

      const res = await api.post('/academic/results/publish', payload);
      if (res.data.success) {
        setGradingFeedback({
          type: 'success',
          text: `✔ Official Marksheet successfully published for ${selectedStudentForGrading.name} (Aggregate: ${res.data.result.percentage}%, Grade: ${res.data.result.overallGrade})!`,
        });
        setSelectedStudentForGrading(null);
      }
    } catch (err) {
      setGradingFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to publish student result.',
      });
    } finally {
      setSavingExamResult(false);
    }
  };

  // ---------------------------------------------------------
  // Communication & Leaves Handlers (Phase 10)
  // ---------------------------------------------------------
  const handleReviewLeave = async (leaveId, status, remark) => {
    try {
      const res = await api.patch(`/communication/leaves/${leaveId}/review`, {
        status,
        adminRemark: remark || `Leave ${status.toLowerCase()} by Class Teacher.`,
      });
      if (res.data.success) {
        fetchCommunicationData();
      }
    } catch (err) {
      alert('Failed to update leave status');
    }
  };

  const handleTeacherPostNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communication/notices', {
        ...newNoticeForm,
        postedBy: `${user?.name || 'Class Teacher'} (Faculty)`,
      });
      if (res.data.success) {
        setShowTeacherNoticeModal(false);
        setNewNoticeForm({
          title: '',
          content: '',
          category: 'Important Announcement',
          audience: 'Students',
          priority: 'High',
        });
        fetchCommunicationData();
      }
    } catch (err) {
      alert('Failed to post circular');
    }
  };

  const handleRespondComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaintToRespond) return;
    try {
      const res = await api.patch(`/communication/complaints/${selectedComplaintToRespond._id}/respond`, {
        status: 'Resolved',
        adminResponse: teacherResponseText,
      });
      if (res.data.success) {
        setSelectedComplaintToRespond(null);
        setTeacherResponseText('');
        fetchCommunicationData();
      }
    } catch (err) {
      alert('Failed to respond to grievance');
    }
  };

  const uniqueClassNames = Array.from(new Set(classesList.map((c) => c.name)));
  const availableSections = classesList
    .filter((c) => c.name === selectedClassName)
    .map((c) => c.section);

  const studentsInSelectedClass = studentsList.filter(
    (s) => s.className === selectedClassName && s.section === selectedSection
  );

  return (
    <div className="dashboard-container">
      {/* 1. Portal Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="portal-badge badge-teacher">👨‍🏫 Faculty Portal • CBSE Session 2026-27</div>
          <h1>Faculty Management & Instruction Hub</h1>
          <p className="subtitle">
            Welcome back, <strong>{user?.name}</strong> • Mark classroom attendance, publish NCERT coursework, and evaluate CBSE exam marks
          </p>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="faculty-portal-tabs">
          <button
            className={`portal-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            📝 Coursework ({assignments.length})
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'grading' ? 'active' : ''}`}
            onClick={() => setActiveTab('grading')}
          >
            📊 CBSE Marks Entry & Results
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'communication' ? 'active' : ''}`}
            onClick={() => setActiveTab('communication')}
          >
            📢 Leaves & Circulars ({leavesList.filter((l) => l.status === 'Pending').length} Pending)
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            📋 Classroom Attendance
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: ASSIGNMENTS & GRADING (PHASE 7/8)
         ========================================================= */}
      {activeTab === 'assignments' && (
        <div>
          <div className="module-controls-bar">
            <div>
              <h3>Coursework & Homework Assignments</h3>
              <p className="subtitle">Create assignments, set deadlines, upload reference files, and grade student submissions</p>
            </div>

            <button
              onClick={() => {
                setAssignmentForm({
                  ...initialAssignmentForm,
                  deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
                });
                setShowCreateAssignmentModal(true);
              }}
              className="btn btn-primary"
            >
              + Create New Assignment
            </button>
          </div>

          <div className="assignments-grid">
            {loadingAssignments ? (
              <div className="module-loading">Loading coursework assignments...</div>
            ) : assignments.length > 0 ? (
              assignments.map((assignment) => {
                const deadlineDate = new Date(assignment.deadline);
                const isOverdue = new Date() > deadlineDate;
                const submissionCount = assignment.submissions?.length || 0;
                const gradedCount = assignment.submissions?.filter((s) => s.status === 'Graded').length || 0;

                return (
                  <div key={assignment._id} className="card assignment-card">
                    <div className="assignment-card-header">
                      <div>
                        <span className="badge badge-student">
                          {assignment.className} - {assignment.section}
                        </span>
                        <h3 className="assignment-title">{assignment.title}</h3>
                        <span className="assignment-subject-sub">
                          📖 {assignment.subjectName} ({assignment.subjectCode}) • <strong>{assignment.totalMarks} Max Marks</strong>
                        </span>
                      </div>

                      <span className={`deadline-pill ${isOverdue ? 'overdue' : 'active'}`}>
                        {isOverdue ? '🔴 Closed' : '⏰ Due'} {deadlineDate.toLocaleDateString()}
                      </span>
                    </div>

                    <p className="assignment-desc">{assignment.description}</p>

                    {assignment.attachmentName && (
                      <div className="attachment-box">
                        <span>📎 Reference Material:</span>
                        <a
                          href={assignment.attachmentUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="attachment-link"
                          onClick={(e) => {
                            if (!assignment.attachmentUrl) {
                              e.preventDefault();
                              alert(`Downloading sample file: ${assignment.attachmentName}`);
                            }
                          }}
                        >
                          📄 {assignment.attachmentName}
                        </a>
                      </div>
                    )}

                    <div className="submissions-progress-box">
                      <div className="submissions-meta-row">
                        <span>Student Submissions:</span>
                        <strong>
                          {submissionCount} Submitted • {gradedCount} Graded
                        </strong>
                      </div>
                      <div className="mini-progress-track">
                        <div
                          className="mini-progress-fill"
                          style={{
                            width: `${Math.min(100, (submissionCount / 5) * 100)}%`,
                            backgroundColor: gradedCount === submissionCount && submissionCount > 0 ? '#10b981' : '#4f46e5',
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="assignment-card-actions">
                      <button
                        onClick={() => openSubmissionsModal(assignment)}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        👁️ Submissions & Grade ({submissionCount})
                      </button>
                      <button
                        onClick={() => openEditModal(assignment)}
                        className="btn-action-icon"
                        title="Edit Assignment"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="btn-action-icon text-danger"
                        title="Delete Assignment"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-table-msg card">
                No assignments published yet. Click "+ Create New Assignment" to post coursework!
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: CBSE MARKS ENTRY & RESULTS (PHASE 9)
         ========================================================= */}
      {activeTab === 'grading' && (
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="attendance-steps-bar">
              <div className="step-group">
                <label className="step-label">1. Select Examination</label>
                <select
                  value={selectedExamName}
                  onChange={(e) => {
                    setSelectedExamName(e.target.value);
                    const found = examsList.find((ex) => ex.name === e.target.value);
                    if (found) setSelectedExamType(found.examType);
                  }}
                  className="form-control"
                >
                  {examsList.map((ex) => (
                    <option key={ex._id} value={ex.name}>
                      📝 {ex.name} ({ex.examType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="step-group">
                <label className="step-label">2. Select Class</label>
                <select
                  value={selectedClassName}
                  onChange={(e) => setSelectedClassName(e.target.value)}
                  className="form-control"
                >
                  {uniqueClassNames.map((cName) => (
                    <option key={cName} value={cName}>🏫 {cName}</option>
                  ))}
                </select>
              </div>

              <div className="step-group">
                <label className="step-label">3. Select Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="form-control"
                >
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>📍 {sec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {gradingFeedback && (
            <div className={`alert ${gradingFeedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {gradingFeedback.text}
            </div>
          )}

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Student Roster — {selectedClassName} ({selectedSection})</h3>
                <p className="subtitle">
                  Grading Examination: <strong>{selectedExamName}</strong> • Academic Session <strong>2026-27</strong>
                </p>
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Admission No</th>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Parents (Father & Mother)</th>
                    <th>Contact (+91)</th>
                    <th>Marksheet Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsInSelectedClass.length > 0 ? (
                    studentsInSelectedClass.map((st) => (
                      <tr key={st._id}>
                        <td><span className="code-pill">{st.admissionNumber}</span></td>
                        <td><strong>#{st.rollNumber}</strong></td>
                        <td><strong>{st.name}</strong></td>
                        <td>{st.fatherName} & {st.motherName}</td>
                        <td>📞 {st.parentContact}</td>
                        <td><span className="status-pill status-approved">✔ Ready for Marksheet</span></td>
                        <td>
                          <button
                            onClick={() => handleOpenMarksEntry(st)}
                            className="btn btn-primary btn-sm"
                          >
                            📝 Enter Subject Marks & Grade
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-table-msg">
                        No students enrolled in this class and section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedStudentForGrading && (
            <div className="modal-backdrop">
              <div className="modal-box modal-lg">
                <div className="modal-header">
                  <div>
                    <h3>📝 Enter CBSE Examination Marks</h3>
                    <p className="subtitle">
                      Student: <strong>{selectedStudentForGrading.name}</strong> (Adm No: {selectedStudentForGrading.admissionNumber} • Roll #{selectedStudentForGrading.rollNumber})
                    </p>
                  </div>
                  <button onClick={() => setSelectedStudentForGrading(null)} className="close-btn">&times;</button>
                </div>

                <form onSubmit={handlePublishMarksheet} className="modal-form">
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Theory Marks (/80)</th>
                          <th>Practical Marks (/20)</th>
                          <th>Max Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectMarksForm.map((subj, sIdx) => (
                          <tr key={sIdx}>
                            <td><strong>{subj.subjectName}</strong> <span className="code-pill">{subj.subjectCode}</span></td>
                            <td>
                              <input
                                type="number"
                                required
                                max={80}
                                min={0}
                                value={subj.theoryMarks}
                                onChange={(e) => handleSubjectMarkChange(sIdx, 'theoryMarks', e.target.value)}
                                className="form-control"
                                style={{ width: '110px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                required
                                max={20}
                                min={0}
                                value={subj.practicalMarks}
                                onChange={(e) => handleSubjectMarkChange(sIdx, 'practicalMarks', e.target.value)}
                                className="form-control"
                                style={{ width: '110px' }}
                              />
                            </td>
                            <td>100 Marks</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Class Teacher Remarks *</label>
                    <input
                      type="text"
                      required
                      value={teacherRemarks}
                      onChange={(e) => setTeacherRemarks(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForGrading(null)}
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={savingExamResult} className="btn btn-primary">
                      {savingExamResult ? 'Calculating & Publishing...' : '💾 Publish Official Marksheet'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: LEAVES & CIRCULARS (PHASE 10)
         ========================================================= */}
      {activeTab === 'communication' && (
        <div>
          {/* Sub-Tabs: Leaves vs Notices vs Complaints */}
          <div className="assignment-subtabs-row">
            <div className="view-mode-toggle">
              <button
                className={`toggle-btn ${commSubTab === 'leaves' ? 'active' : ''}`}
                onClick={() => setCommSubTab('leaves')}
              >
                🏖️ Student Leave Requests ({leavesList.filter((l) => l.status === 'Pending').length} Pending)
              </button>
              <button
                className={`toggle-btn ${commSubTab === 'notices' ? 'active' : ''}`}
                onClick={() => setCommSubTab('notices')}
              >
                📌 School Circulars ({notices.length})
              </button>
              <button
                className={`toggle-btn ${commSubTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setCommSubTab('complaints')}
              >
                💬 Student Grievances ({complaintsList.length})
              </button>
            </div>
          </div>

          {commSubTab === 'leaves' ? (
            /* Sub-Tab 1: Student Leave Sanction Desk */
            <div className="card">
              <div className="card-header">
                <h3>Student Leave Applications (Class Teacher Desk)</h3>
                <p className="subtitle">Approve or reject absence requests submitted by students in your assigned class</p>
              </div>

              <div className="table-responsive" style={{ marginTop: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Class & Roll</th>
                      <th>Leave Type</th>
                      <th>Period (From - To)</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Sanction Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leavesList.length > 0 ? (
                      leavesList.map((l) => (
                        <tr key={l._id}>
                          <td><strong>{l.applicantName}</strong></td>
                          <td><span className="badge badge-student">{l.className || 'Class 10'} • #{l.rollNumber || '101'}</span></td>
                          <td><strong>{l.leaveType}</strong></td>
                          <td>📅 {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}</td>
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
                                  onClick={() => handleReviewLeave(l._id, 'Approved', 'Leave sanctioned by Class Teacher Mrs. Neha Sharma.')}
                                  className="btn btn-primary btn-sm"
                                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                >
                                  ✔ Approve
                                </button>
                                <button
                                  onClick={() => handleReviewLeave(l._id, 'Rejected', 'Rejected due to low semester attendance.')}
                                  className="btn btn-outline-danger btn-sm"
                                >
                                  ✖ Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {l.adminRemark ? `"${l.adminRemark}"` : l.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="empty-table-msg">No leave requests currently pending.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : commSubTab === 'notices' ? (
            /* Sub-Tab 2: School Circulars */
            <div>
              <div className="module-controls-bar">
                <div>
                  <h3>Official School Circulars & Notice Board</h3>
                  <p className="subtitle">Broadcast circulars to students or review administrative announcements</p>
                </div>
                <button onClick={() => setShowTeacherNoticeModal(true)} className="btn btn-primary">
                  + Broadcast Circular
                </button>
              </div>

              <div className="notices-grid">
                {notices.map((n) => (
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
                      <span>✍️ Posted by: <strong>{n.postedBy}</strong></span>
                      <span>📅 {new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Sub-Tab 3: Student Grievances */
            <div className="card">
              <div className="card-header">
                <h3>Student Grievance & Academic Queries</h3>
                <p className="subtitle">Respond to doubts and academic assistance requests</p>
              </div>

              <div className="complaints-list" style={{ marginTop: '1rem' }}>
                {complaintsList.map((c) => (
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
                          <strong style={{ color: '#166534' }}>✔ Recorded Resolution:</strong>
                          <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Responded by {c.resolvedBy}</span>
                        </div>
                        <p style={{ margin: 0, color: '#14532d', fontSize: '0.9rem' }}>{c.adminResponse}</p>
                      </div>
                    )}

                    <div className="complaint-footer">
                      <div className="submitted-by-tag">
                        👤 Student: <strong>{c.studentName}</strong> ({c.className})
                      </div>
                      {c.status !== 'Resolved' && (
                        <button
                          onClick={() => {
                            setSelectedComplaintToRespond(c);
                            setTeacherResponseText(c.adminResponse || '');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          💬 Provide Response & Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 4: ATTENDANCE RECORDING (PHASE 6/8)
         ========================================================= */}
      {activeTab === 'attendance' && (
        <div>
          <div className="card attendance-selector-card">
            <div className="attendance-steps-bar">
              <div className="step-group">
                <label className="step-label">1. Select Class</label>
                <select
                  value={selectedClassName}
                  onChange={(e) => setSelectedClassName(e.target.value)}
                  className="form-control"
                >
                  {uniqueClassNames.map((cName) => (
                    <option key={cName} value={cName}>🏫 {cName}</option>
                  ))}
                </select>
              </div>

              <div className="step-group">
                <label className="step-label">2. Select Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="form-control"
                >
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>📍 {sec}</option>
                  ))}
                </select>
              </div>

              <div className="step-group">
                <label className="step-label">3. Select Subject</label>
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => {
                    const found = availableSubjects.find((s) => s.subjectCode === e.target.value);
                    if (found) {
                      setSelectedSubject(found.subjectName);
                      setSelectedSubjectCode(found.subjectCode);
                    }
                  }}
                  className="form-control"
                >
                  {availableSubjects.map((s, idx) => (
                    <option key={idx} value={s.subjectCode}>
                      📖 {s.subjectName} ({s.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="step-group">
                <label className="step-label">4. Session Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {attendanceFeedback && (
            <div className={`alert ${attendanceFeedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {attendanceFeedback.text}
            </div>
          )}

          <div className="card attendance-sheet-card">
            <div className="attendance-sheet-header">
              <div>
                <h3>Student Roster — {selectedClassName} ({selectedSection})</h3>
                <p className="subtitle">
                  Session: <strong>{selectedSubject}</strong> • Date: <strong>{selectedDate}</strong>{' '}
                  {alreadyMarked && <span className="badge badge-teacher" style={{ marginLeft: '0.5rem' }}>✔ Marked & Saved</span>}
                </p>
              </div>

              <div className="quick-mark-toolbar">
                <button onClick={() => handleMarkAll('Present')} className="btn btn-outline-success btn-sm">
                  🟢 Mark All Present
                </button>
                <button onClick={() => handleMarkAll('Absent')} className="btn btn-outline-danger btn-sm">
                  🔴 Mark All Absent
                </button>
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              {loadingRoster ? (
                <div className="module-loading">Loading student roster...</div>
              ) : roster.length > 0 ? (
                <table className="data-table attendance-roster-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Attendance Status</th>
                      <th>Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student, idx) => (
                      <tr key={idx} className={`attendance-row status-row-${student.status.toLowerCase()}`}>
                        <td><span className="code-pill">{student.rollNumber}</span></td>
                        <td><strong>{student.studentName}</strong></td>
                        <td>
                          <div className="status-toggle-group">
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(idx, 'Present')}
                              className={`btn-toggle-status btn-present ${student.status === 'Present' ? 'active' : ''}`}
                            >
                              🟢 Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(idx, 'Absent')}
                              className={`btn-toggle-status btn-absent ${student.status === 'Absent' ? 'active' : ''}`}
                            >
                              🔴 Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(idx, 'Late')}
                              className={`btn-toggle-status btn-late ${student.status === 'Late' ? 'active' : ''}`}
                            >
                              🟡 Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(idx, 'Leave')}
                              className={`btn-toggle-status btn-leave ${student.status === 'Leave' ? 'active' : ''}`}
                            >
                              🟣 Leave
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Optional notes"
                            value={student.remark || ''}
                            onChange={(e) => handleSetStudentRemark(idx, e.target.value)}
                            className="form-control remark-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-table-msg">No students enrolled.</div>
              )}
            </div>

            <div className="attendance-footer-actions">
              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance || roster.length === 0}
                className="btn btn-primary btn-lg"
              >
                {savingAttendance ? 'Saving Attendance...' : '💾 Save & Commit Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          5. CREATE / EDIT ASSIGNMENT MODAL
         ========================================================= */}
      {(showCreateAssignmentModal || showEditAssignmentModal) && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3>{showCreateAssignmentModal ? '📝 Create New Assignment' : `✏️ Edit: ${assignmentForm.title}`}</h3>
              <button
                onClick={() => {
                  setShowCreateAssignmentModal(false);
                  setShowEditAssignmentModal(false);
                }}
                className="close-btn"
              >
                &times;
              </button>
            </div>

            <form onSubmit={showCreateAssignmentModal ? handleCreateAssignment : handleEditAssignment} className="modal-form">
              <div className="form-group">
                <label>Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NCERT Quadratic Equations Problem Set"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Class *</label>
                  <select
                    value={assignmentForm.className}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, className: e.target.value })}
                    className="form-control"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Class 9">Class 9</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Section *</label>
                  <select
                    value={assignmentForm.section}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, section: e.target.value })}
                    className="form-control"
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Subject *</label>
                  <select
                    value={assignmentForm.subjectCode}
                    onChange={(e) => {
                      const names = {
                        'MTH-101': 'Mathematics',
                        'SCI-101': 'Science',
                        'HIN-101': 'Hindi',
                        'ENG-101': 'English',
                        'SST-101': 'Social Science',
                        'CS-101': 'Computer',
                      };
                      setAssignmentForm({
                        ...assignmentForm,
                        subjectCode: e.target.value,
                        subjectName: names[e.target.value] || 'Mathematics',
                      });
                    }}
                    className="form-control"
                  >
                    <option value="MTH-101">Mathematics</option>
                    <option value="SCI-101">Science</option>
                    <option value="HIN-101">Hindi</option>
                    <option value="ENG-101">English</option>
                    <option value="SST-101">Social Science</option>
                    <option value="CS-101">Computer</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.deadline}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Maximum Marks</label>
                  <input
                    type="number"
                    required
                    value={assignmentForm.totalMarks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, totalMarks: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assignment Instructions & Questions *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detail the homework problem statement, deliverables, and submission guidelines..."
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Attach Problem Sheet Document Name</label>
                  <input
                    type="text"
                    placeholder="e.g. NCERT_Maths_Worksheet_Ex4.3.pdf"
                    value={assignmentForm.attachmentName}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, attachmentName: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>File Resource URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://school-cloud.storage/materials/sheet.pdf"
                    value={assignmentForm.attachmentUrl}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, attachmentUrl: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAssignmentModal(false);
                    setShowEditAssignmentModal(false);
                  }}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showCreateAssignmentModal ? 'Publish Assignment' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          6. SUBMISSIONS & HOMEWORK GRADING MODAL
         ========================================================= */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <div>
                <h3>📥 Student Submissions & Grading</h3>
                <p className="subtitle">
                  {selectedAssignment.title} • <strong>{selectedAssignment.totalMarks} Max Marks</strong>
                </p>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="close-btn">&times;</button>
            </div>

            <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 ? (
                <div className="submissions-cards-list">
                  {selectedAssignment.submissions.map((sub) => (
                    <div key={sub._id} className="card submission-item-card">
                      <div className="submission-item-header">
                        <div>
                          <span className="code-pill">{sub.rollNumber}</span>{' '}
                          <strong style={{ fontSize: '1.05rem' }}>{sub.studentName}</strong>
                          <div className="submission-time-text">
                            Turned in: {new Date(sub.submittedAt).toLocaleString()}
                          </div>
                        </div>

                        <div>
                          {sub.status === 'Graded' ? (
                            <span className="badge badge-teacher" style={{ fontSize: '0.9rem' }}>
                              ⭐ Graded: {sub.marksObtained} / {selectedAssignment.totalMarks}
                            </span>
                          ) : (
                            <span className="badge badge-student">⏳ Pending Grading</span>
                          )}
                        </div>
                      </div>

                      <div className="submission-text-quote">
                        <p>"{sub.submissionText}"</p>
                        {sub.fileName && (
                          <div style={{ marginTop: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Attached Solution: </span>
                            <a
                              href={sub.fileUrl || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="attachment-link"
                              onClick={(e) => {
                                if (!sub.fileUrl) {
                                  e.preventDefault();
                                  alert(`Downloading student file: ${sub.fileName}`);
                                }
                              }}
                            >
                              📄 {sub.fileName}
                            </a>
                          </div>
                        )}
                      </div>

                      {sub.status === 'Graded' && sub.feedback && gradingSubmissionId !== sub._id && (
                        <div className="feedback-display-box">
                          <strong>Faculty Feedback:</strong> {sub.feedback}
                        </div>
                      )}

                      {gradingSubmissionId === sub._id ? (
                        <div className="inline-grading-form">
                          <div className="form-row">
                            <div className="form-group" style={{ width: '140px' }}>
                              <label>Score (/{selectedAssignment.totalMarks})</label>
                              <input
                                type="number"
                                max={selectedAssignment.totalMarks}
                                placeholder="Marks"
                                value={marksInput}
                                onChange={(e) => setMarksInput(e.target.value)}
                                className="form-control"
                                required
                              />
                            </div>
                            <div className="form-group flex-1">
                              <label>Constructive Feedback</label>
                              <input
                                type="text"
                                placeholder="e.g. Excellent work! Clear and neat step-by-step logic."
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                className="form-control"
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                              onClick={() => handleSaveGrade(sub._id)}
                              className="btn btn-primary btn-sm"
                            >
                              💾 Save Grade
                            </button>
                            <button
                              onClick={() => setGradingSubmissionId(null)}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setGradingSubmissionId(sub._id);
                              setMarksInput(sub.marksObtained !== null ? sub.marksObtained : '');
                              setFeedbackInput(sub.feedback || '');
                            }}
                            className="btn btn-outline-primary btn-sm"
                          >
                            {sub.status === 'Graded' ? '✏️ Modify Grade & Feedback' : '📝 Grade Submission'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-table-msg">
                  No students have turned in this assignment yet.
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => setShowSubmissionsModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          7. TEACHER BROADCAST NOTICE MODAL (PHASE 10)
         ========================================================= */}
      {showTeacherNoticeModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>📢 Broadcast Class Circular</h3>
              <button onClick={() => setShowTeacherNoticeModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleTeacherPostNotice} className="modal-form">
              <div className="form-group">
                <label>Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics Practice Test Date Sheet"
                  value={newNoticeForm.title}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Category *</label>
                  <select
                    value={newNoticeForm.category}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="Exam Notice">Exam Notice</option>
                    <option value="PTM Notice">PTM Notice</option>
                    <option value="Holiday Notice">Holiday Notice</option>
                    <option value="School Event">School Event</option>
                    <option value="Important Announcement">Important Announcement</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Target Audience *</label>
                  <select
                    value={newNoticeForm.audience}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, audience: e.target.value })}
                    className="form-control"
                  >
                    <option value="Students">Students Only</option>
                    <option value="All">All School</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Circular Content *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write circular text for students and parents..."
                  value={newNoticeForm.content}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, content: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowTeacherNoticeModal(false)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          8. RESPOND TO STUDENT GRIEVANCE MODAL (PHASE 10)
         ========================================================= */}
      {selectedComplaintToRespond && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>💬 Respond to Student Grievance</h3>
              <button onClick={() => setSelectedComplaintToRespond(null)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleRespondComplaint} className="modal-form">
              <p><strong>Topic:</strong> {selectedComplaintToRespond.subject}</p>
              <p><strong>Student:</strong> {selectedComplaintToRespond.studentName} ({selectedComplaintToRespond.className})</p>
              <p className="subtitle" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"{selectedComplaintToRespond.description}"</p>

              <div className="form-group">
                <label>Faculty Response & Resolution Action *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="e.g. Workshop scheduled for Thursday zero period in Room 101."
                  value={teacherResponseText}
                  onChange={(e) => setTeacherResponseText(e.target.value)}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedComplaintToRespond(null)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Resolution & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

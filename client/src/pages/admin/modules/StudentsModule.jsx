import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const StudentsModule = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileTab, setProfileTab] = useState('personal'); // 'personal' | 'family' | 'address' | 'academic'

  // Indian Student Form State
  const initialStudentForm = {
    admissionNumber: '',
    rollNumber: '',
    name: '',
    email: '',
    className: 'Class 10',
    section: 'Section A',
    academicSession: '2026-27',
    admissionDate: new Date().toISOString().split('T')[0],
    dob: '2010-05-14',
    gender: 'Male',
    fatherName: '',
    motherName: '',
    guardianName: '',
    parentContact: '',
    parentEmail: '',
    parentOccupation: 'Business / Service',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    aadhaarNumber: '',
    bloodGroup: 'O+',
    status: 'Active',
  };
  const [studentForm, setStudentForm] = useState(initialStudentForm);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add Student Handler
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/students', studentForm);
      if (res.data.success) {
        setShowAddModal(false);
        setStudentForm(initialStudentForm);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error admitting student');
    }
  };

  // Edit Student Handler
  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/students/${studentForm._id}`, studentForm);
      if (res.data.success) {
        setShowEditModal(false);
        if (selectedStudent && selectedStudent._id === studentForm._id) {
          setSelectedStudent(res.data.student);
        }
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating student record');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (student) => {
    const nextStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.patch(`/admin/students/${student._id}/status`, { status: nextStatus });
      if (res.data.success) {
        if (selectedStudent && selectedStudent._id === student._id) {
          setSelectedStudent({ ...selectedStudent, status: nextStatus });
        }
        fetchStudents();
      }
    } catch (err) {
      alert('Failed to update student status');
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this student record?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      if (selectedStudent && selectedStudent._id === id) {
        setSelectedStudent(null);
      }
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const openEditModal = (student) => {
    setStudentForm({
      ...student,
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '2010-01-01',
      admissionDate: student.admissionDate
        ? new Date(student.admissionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setShowEditModal(true);
  };

  // Filter & Search
  const filteredStudents = students.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchLower) ||
      (s.admissionNumber && s.admissionNumber.toLowerCase().includes(searchLower)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchLower)) ||
      (s.fatherName && s.fatherName.toLowerCase().includes(searchLower)) ||
      (s.motherName && s.motherName.toLowerCase().includes(searchLower)) ||
      (s.city && s.city.toLowerCase().includes(searchLower));

    const matchesClass = classFilter === 'All' || s.className === classFilter;
    const matchesSection = sectionFilter === 'All' || s.section === sectionFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  return (
    <div className="module-view-container">
      {/* 1. Header Controls & Multi-Filter Bar */}
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 Student Enrollment & Admission Register</h3>
          <p className="subtitle">
            Academic Session <strong>2026-27</strong> • Manage CBSE/State Board student profiles and records
          </p>
        </div>

        <div className="search-filter-group">
          <input
            type="text"
            placeholder="🔍 Search name, admission no, roll, father, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control module-search-input"
            style={{ minWidth: '320px' }}
          />

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Classes</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
            <option value="Class 9">Class 9</option>
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Sections</option>
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Statuses</option>
            <option value="Active">🟢 Active</option>
            <option value="Inactive">🔴 Inactive</option>
          </select>

          <button
            onClick={() => {
              setStudentForm({
                ...initialStudentForm,
                admissionNumber: `ADM/2026/01${students.length + 10}`,
                rollNumber: `${100 + students.length + 1}`,
              });
              setShowAddModal(true);
            }}
            className="btn btn-primary"
          >
            + New Student Admission
          </button>
        </div>
      </div>

      {/* 2. Indian Students Data Table */}
      <div className="table-responsive card">
        {loading ? (
          <div className="module-loading">Loading student register...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Class & Section</th>
                <th>Parents (Father & Mother)</th>
                <th>Parent Mobile</th>
                <th>State & City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s._id} className={s.status === 'Inactive' ? 'row-inactive' : ''}>
                    <td>
                      <span className="code-pill">{s.admissionNumber || 'ADM/2026/0101'}</span>
                    </td>
                    <td>
                      <strong>#{s.rollNumber}</strong>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setProfileTab('personal');
                        }}
                        className="btn-link text-left-name"
                        title="Click to view complete student profile"
                      >
                        <strong>{s.name}</strong>
                      </button>
                      <div className="student-email-sub">{s.gender} • {s.academicSession || '2026-27'}</div>
                    </td>
                    <td>
                      <span className="badge badge-student">
                        {s.className} - {s.section}
                      </span>
                    </td>
                    <td>
                      <div><strong>F:</strong> {s.fatherName || 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}><strong>M:</strong> {s.motherName || 'N/A'}</div>
                    </td>
                    <td>
                      <a href={`tel:${s.parentContact}`} style={{ color: '#166534', fontWeight: 600 }}>
                        📞 {s.parentContact}
                      </a>
                    </td>
                    <td>
                      <div>{s.city || 'Delhi'}</div>
                      <span className="relation-tag">{s.state || 'Delhi'}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(s)}
                        className={`status-pill status-${(s.status || 'active').toLowerCase()}`}
                        title="Click to toggle status"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {s.status === 'Active' ? '🟢 Active' : '🔴 Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setProfileTab('personal');
                          }}
                          className="btn-action-icon"
                          title="View Full Profile"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="btn-action-icon"
                          title="Edit Student"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s._id)}
                          className="btn-action-icon text-danger"
                          title="Delete Student"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty-table-msg">
                    No student records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================================================
          3. INDIAN STUDENT PROFILE MODAL (Detailed View)
         ========================================================= */}
      {selectedStudent && (
        <div className="modal-backdrop">
          <div className="modal-box profile-modal-box">
            <div className="profile-modal-header">
              <div className="profile-hero">
                <div className="profile-avatar">🎓</div>
                <div className="profile-hero-info">
                  <h2>{selectedStudent.name}</h2>
                  <div className="profile-meta-tags">
                    <span className="code-pill">{selectedStudent.admissionNumber || 'ADM/2026/0101'}</span>
                    <span className="badge badge-student">Roll #{selectedStudent.rollNumber}</span>
                    <span className="badge badge-teacher">{selectedStudent.className} - {selectedStudent.section}</span>
                    <span className={`status-pill status-${selectedStudent.status.toLowerCase()}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="close-btn">&times;</button>
            </div>

            {/* Profile Tabs */}
            <div className="profile-tabs-nav">
              <button
                className={`profile-tab-btn ${profileTab === 'personal' ? 'active' : ''}`}
                onClick={() => setProfileTab('personal')}
              >
                👤 Identity & Academic
              </button>
              <button
                className={`profile-tab-btn ${profileTab === 'family' ? 'active' : ''}`}
                onClick={() => setProfileTab('family')}
              >
                👨‍👩‍👦 Family & Contact
              </button>
              <button
                className={`profile-tab-btn ${profileTab === 'address' ? 'active' : ''}`}
                onClick={() => setProfileTab('address')}
              >
                📍 Residential Location
              </button>
              <button
                className={`profile-tab-btn ${profileTab === 'academic' ? 'active' : ''}`}
                onClick={() => setProfileTab('academic')}
              >
                📊 Performance
              </button>
            </div>

            {/* Profile Tab Contents */}
            <div className="profile-tab-content">
              {profileTab === 'personal' && (
                <div className="profile-info-grid">
                  <div className="info-tile">
                    <span className="info-label">Admission Number</span>
                    <span className="info-val font-semibold">{selectedStudent.admissionNumber || 'ADM/2026/0101'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Roll Number</span>
                    <span className="info-val font-semibold">#{selectedStudent.rollNumber}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Academic Session</span>
                    <span className="info-val">{selectedStudent.academicSession || '2026-27'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Admission Date</span>
                    <span className="info-val">
                      {new Date(selectedStudent.admissionDate || selectedStudent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Date of Birth</span>
                    <span className="info-val">
                      {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : '14 May 2010'}
                    </span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Gender</span>
                    <span className="info-val">{selectedStudent.gender}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Aadhaar Number</span>
                    <span className="info-val">{selectedStudent.aadhaarNumber || 'XXXX-XXXX-4812 (Masked)'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Blood Group</span>
                    <span className="info-val blood-pill">{selectedStudent.bloodGroup || 'O+'}</span>
                  </div>
                </div>
              )}

              {profileTab === 'family' && (
                <div className="profile-info-grid">
                  <div className="info-tile">
                    <span className="info-label">Father's Name</span>
                    <span className="info-val font-semibold">{selectedStudent.fatherName || 'N/A'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Mother's Name</span>
                    <span className="info-val font-semibold">{selectedStudent.motherName || 'N/A'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Guardian Name (If any)</span>
                    <span className="info-val">{selectedStudent.guardianName || 'Father / Mother'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Primary Parent Mobile (+91)</span>
                    <span className="info-val font-semibold" style={{ color: '#166534' }}>
                      📞 {selectedStudent.parentContact || 'N/A'}
                    </span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Parent Email</span>
                    <span className="info-val">{selectedStudent.parentEmail || 'parent@domain.in'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Parent Occupation</span>
                    <span className="info-val">{selectedStudent.parentOccupation || 'Professional'}</span>
                  </div>
                </div>
              )}

              {profileTab === 'address' && (
                <div className="profile-info-grid">
                  <div className="info-tile full-width">
                    <span className="info-label">Residential Address</span>
                    <span className="info-val">{selectedStudent.address || 'Plot 104, Dayanand Vihar'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">City</span>
                    <span className="info-val font-semibold">{selectedStudent.city || 'New Delhi'}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">State</span>
                    <span className="info-val font-semibold">{selectedStudent.state || 'Delhi'}</span>
                  </div>
                  <div className="info-tile full-width">
                    <span className="info-label">Pincode (6 Digits)</span>
                    <span className="info-val font-semibold" style={{ color: '#4f46e5' }}>
                      📮 {selectedStudent.pincode || '110001'}
                    </span>
                  </div>
                </div>
              )}

              {profileTab === 'academic' && (
                <div className="profile-academic-summary">
                  <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1rem' }}>
                    <div className="stat-card">
                      <div className="stat-icon">⭐</div>
                      <div className="stat-info">
                        <h3>{selectedStudent.gpa || 3.85}</h3>
                        <p>Cumulative GPA</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📅</div>
                      <div className="stat-info">
                        <h3>{selectedStudent.attendanceRate || 96}%</h3>
                        <p>Attendance Rate</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🏫</div>
                      <div className="stat-info">
                        <h3>{selectedStudent.className}</h3>
                        <p>{selectedStudent.section}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                onClick={() => {
                  const s = selectedStudent;
                  setSelectedStudent(null);
                  openEditModal(s);
                }}
                className="btn btn-outline-primary"
              >
                ✏️ Edit Student Info
              </button>
              <button
                onClick={() => handleToggleStatus(selectedStudent)}
                className={`btn ${selectedStudent.status === 'Active' ? 'btn-outline-danger' : 'btn-primary'}`}
              >
                {selectedStudent.status === 'Active' ? '🔴 Deactivate Student' : '🟢 Activate Student'}
              </button>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          4. 🇮🇳 INDIAN SCHOOL ADMISSION FORM (ADD / EDIT)
         ========================================================= */}
      {(showAddModal || showEditModal) && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3>{showAddModal ? '🎓 New Student Admission (Session 2026-27)' : `✏️ Edit Student: ${studentForm.name}`}</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="close-btn"
              >
                &times;
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddStudent : handleEditStudent} className="modal-form">
              {/* Section 1: Academic & Identity Information */}
              <div className="form-section-header">1. Academic & Identity Details</div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Admission Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADM/2026/0109"
                    value={studentForm.admissionNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, admissionNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 109"
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Academic Session</label>
                  <input
                    type="text"
                    value={studentForm.academicSession}
                    onChange={(e) => setStudentForm({ ...studentForm, academicSession: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="aarav@school.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Class *</label>
                  <select
                    value={studentForm.className}
                    onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                    className="form-control"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 8">Class 8</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Section *</label>
                  <select
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="form-control"
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={studentForm.dob}
                    onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Gender *</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="form-control"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Admission Date</label>
                  <input
                    type="date"
                    value={studentForm.admissionDate}
                    onChange={(e) => setStudentForm({ ...studentForm, admissionDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Aadhaar Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-1234"
                    value={studentForm.aadhaarNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, aadhaarNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Blood Group</label>
                  <select
                    value={studentForm.bloodGroup}
                    onChange={(e) => setStudentForm({ ...studentForm, bloodGroup: e.target.value })}
                    className="form-control"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Family & Parent Details */}
              <div className="form-section-header">2. Parent & Guardian Information</div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Father's Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Rajesh Sharma"
                    value={studentForm.fatherName}
                    onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Mother's Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Sunita Sharma"
                    value={studentForm.motherName}
                    onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Guardian Name (If any)</label>
                  <input
                    type="text"
                    placeholder="Optional guardian name"
                    value={studentForm.guardianName}
                    onChange={(e) => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Parent Contact Number (+91) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={studentForm.parentContact}
                    onChange={(e) => setStudentForm({ ...studentForm, parentContact: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Parent Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. Chartered Accountant"
                    value={studentForm.parentOccupation}
                    onChange={(e) => setStudentForm({ ...studentForm, parentOccupation: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Section 3: Residential Address */}
              <div className="form-section-header">3. Residential Address</div>
              <div className="form-group">
                <label>Street Address / House No / Colony *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-402, Shanti Kunj Apartments, Sector 62"
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Noida / New Delhi"
                    value={studentForm.city}
                    onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>State *</label>
                  <select
                    value={studentForm.state}
                    onChange={(e) => setStudentForm({ ...studentForm, state: e.target.value })}
                    className="form-control"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Pincode (6 Digits) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 201301"
                    value={studentForm.pincode}
                    onChange={(e) => setStudentForm({ ...studentForm, pincode: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showAddModal ? 'Admit Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsModule;

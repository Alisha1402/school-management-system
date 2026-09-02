import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const ALL_AVAILABLE_CLASSES = [
  'Class 10 - Section A',
  'Class 10 - Section B',
  'Class 11 - Section A',
  'Class 9 - Section A',
  'Class 12 - Section A',
];

const ALL_AVAILABLE_SUBJECTS = [
  'Hindi',
  'English',
  'Mathematics',
  'Science',
  'Social Science',
  'Computer',
  'Sanskrit',
  'General Knowledge',
  'Physical Education',
];

const TeachersModule = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Forms
  const initialTeacherForm = {
    employeeId: '',
    name: '',
    email: '',
    department: 'Mathematics',
    qualification: 'M.Sc (Mathematics), B.Ed',
    experienceYears: 8,
    phone: '',
    address: 'Sector 62, Noida, Uttar Pradesh - 201301',
    subject: 'Mathematics',
    status: 'Active',
    bio: 'Senior CBSE educator dedicated to academic excellence.',
    assignedClasses: ['Class 10 - Section A'],
    assignedSubjects: ['Mathematics'],
  };
  const [teacherForm, setTeacherForm] = useState(initialTeacherForm);

  // Assignment Modal State
  const [assigningClasses, setAssigningClasses] = useState([]);
  const [assigningSubjects, setAssigningSubjects] = useState([]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/teachers');
      if (res.data.success) {
        setTeachers(res.data.teachers);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Add Teacher Handler
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/teachers', teacherForm);
      if (res.data.success) {
        setShowAddModal(false);
        setTeacherForm(initialTeacherForm);
        fetchTeachers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error onboarding teacher');
    }
  };

  // Edit Teacher Handler
  const handleEditTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/teachers/${teacherForm._id}`, teacherForm);
      if (res.data.success) {
        setShowEditModal(false);
        if (selectedTeacher && selectedTeacher._id === teacherForm._id) {
          setSelectedTeacher(res.data.teacher);
        }
        fetchTeachers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating teacher');
    }
  };

  // Save Course & Class Assignments
  const handleSaveAssignments = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/teachers/${selectedTeacher._id}/assignments`, {
        assignedClasses: assigningClasses,
        assignedSubjects: assigningSubjects,
      });
      if (res.data.success) {
        setShowAssignModal(false);
        setSelectedTeacher(res.data.teacher);
        fetchTeachers();
      }
    } catch (err) {
      alert('Failed to save assignments');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (teacher) => {
    const nextStatus =
      teacher.status === 'Active'
        ? 'On Leave'
        : teacher.status === 'On Leave'
        ? 'Inactive'
        : 'Active';

    try {
      const res = await api.patch(`/admin/teachers/${teacher._id}/status`, { status: nextStatus });
      if (res.data.success) {
        if (selectedTeacher && selectedTeacher._id === teacher._id) {
          setSelectedTeacher({ ...selectedTeacher, status: nextStatus });
        }
        fetchTeachers();
      }
    } catch (err) {
      alert('Failed to update faculty status');
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to remove this faculty record?')) return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      if (selectedTeacher && selectedTeacher._id === id) {
        setSelectedTeacher(null);
      }
      fetchTeachers();
    } catch (err) {
      alert('Failed to delete teacher');
    }
  };

  const openEditModal = (teacher) => {
    setTeacherForm(teacher);
    setShowEditModal(true);
  };

  const openAssignModal = (teacher) => {
    setSelectedTeacher(teacher);
    setAssigningClasses(teacher.assignedClasses || []);
    setAssigningSubjects(teacher.assignedSubjects || []);
    setShowAssignModal(true);
  };

  const toggleClassSelection = (cls) => {
    setAssigningClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const toggleSubjectSelection = (sub) => {
    setAssigningSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  // Filter & Search
  const filteredTeachers = teachers.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(searchLower) ||
      t.employeeId.toLowerCase().includes(searchLower) ||
      t.department.toLowerCase().includes(searchLower) ||
      (t.subject && t.subject.toLowerCase().includes(searchLower));

    const matchesDept = departmentFilter === 'All' || t.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="module-view-container">
      {/* 1. Header Controls & Multi-Filters */}
      <div className="module-controls-bar">
        <div className="search-filter-group">
          <input
            type="text"
            placeholder="🔍 Search faculty by name, ID, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control module-search-input"
            style={{ minWidth: '320px' }}
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Departments</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Humanities">Humanities</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Statuses</option>
            <option value="Active">🟢 Active</option>
            <option value="On Leave">🟡 On Leave</option>
            <option value="Inactive">🔴 Inactive</option>
          </select>
        </div>

        <button
          onClick={() => {
            setTeacherForm(initialTeacherForm);
            setShowAddModal(true);
          }}
          className="btn btn-primary"
        >
          + Onboard New Faculty
        </button>
      </div>

      {/* 2. Teachers Cards Grid */}
      <div className="teachers-cards-grid">
        {loading ? (
          <div className="module-loading">Loading faculty directory...</div>
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((t) => (
            <div key={t._id} className="card teacher-item-card">
              <div className="teacher-card-top">
                <div className="teacher-avatar">👨‍🏫</div>
                <div>
                  <button
                    onClick={() => setSelectedTeacher(t)}
                    className="btn-link text-left-name"
                    title="View faculty profile"
                  >
                    <h3 className="teacher-name">{t.name}</h3>
                  </button>
                  <span className="badge badge-teacher">{t.department}</span>
                </div>
              </div>

              <div className="teacher-details">
                <div className="teacher-info-row">
                  <span>🆔 Employee ID:</span>
                  <strong>{t.employeeId}</strong>
                </div>
                <div className="teacher-info-row">
                  <span>🎓 Qualification:</span>
                  <span>{t.qualification}</span>
                </div>
                <div className="teacher-info-row">
                  <span>⏳ Experience:</span>
                  <span><strong>{t.experienceYears || 5}</strong> years</span>
                </div>
                <div className="teacher-info-row">
                  <span>✉️ Email:</span>
                  <span>{t.email}</span>
                </div>
              </div>

              {/* Assigned Classes & Subjects Pills Preview */}
              <div className="teacher-assignments-preview">
                <div className="assignment-preview-header">
                  <span>Assigned Classes ({t.assignedClasses?.length || 0}):</span>
                </div>
                <div className="assignment-pills-row">
                  {(t.assignedClasses || []).map((cls, idx) => (
                    <span key={idx} className="badge badge-student">{cls}</span>
                  ))}
                  {(!t.assignedClasses || t.assignedClasses.length === 0) && (
                    <span className="text-muted text-xs">No classes allocated</span>
                  )}
                </div>

                <div className="assignment-preview-header" style={{ marginTop: '0.4rem' }}>
                  <span>Assigned Courses:</span>
                </div>
                <div className="assignment-pills-row">
                  {(t.assignedSubjects || []).map((sub, idx) => (
                    <span key={idx} className="badge badge-teacher">{sub}</span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="teacher-card-actions">
                <button
                  onClick={() => handleToggleStatus(t)}
                  className={`status-pill status-${(t.status || 'active').toLowerCase().replace(' ', '-')}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                  title="Click to cycle status: Active -> On Leave -> Inactive"
                >
                  {t.status}
                </button>

                <div className="table-actions-row">
                  <button
                    onClick={() => setSelectedTeacher(t)}
                    className="btn-action-icon"
                    title="View Profile"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => openAssignModal(t)}
                    className="btn-action-icon"
                    title="Assign Classes & Subjects"
                  >
                    📚
                  </button>
                  <button
                    onClick={() => openEditModal(t)}
                    className="btn-action-icon"
                    title="Edit Faculty"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(t._id)}
                    className="btn-action-icon text-danger"
                    title="Delete Record"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-table-msg card">No faculty members found matching your search.</div>
        )}
      </div>

      {/* =========================================================
          3. TEACHER PROFILE MODAL
         ========================================================= */}
      {selectedTeacher && !showAssignModal && (
        <div className="modal-backdrop">
          <div className="modal-box profile-modal-box">
            <div className="profile-modal-header">
              <div className="profile-hero">
                <div className="profile-avatar">👨‍🏫</div>
                <div className="profile-hero-info">
                  <h2>{selectedTeacher.name}</h2>
                  <div className="profile-meta-tags">
                    <span className="code-pill">{selectedTeacher.employeeId}</span>
                    <span className="badge badge-teacher">{selectedTeacher.department}</span>
                    <span className={`status-pill status-${selectedTeacher.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedTeacher.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedTeacher(null)} className="close-btn">&times;</button>
            </div>

            <div className="profile-tab-content">
              <div className="profile-info-grid">
                <div className="info-tile">
                  <span className="info-label">Email Address</span>
                  <span className="info-val">{selectedTeacher.email}</span>
                </div>
                <div className="info-tile">
                  <span className="info-label">Contact Phone</span>
                  <span className="info-val">{selectedTeacher.phone || '+1-555-0199'}</span>
                </div>
                <div className="info-tile">
                  <span className="info-label">Academic Qualification</span>
                  <span className="info-val font-semibold">{selectedTeacher.qualification}</span>
                </div>
                <div className="info-tile">
                  <span className="info-label">Teaching Experience</span>
                  <span className="info-val">{selectedTeacher.experienceYears || 5} Years</span>
                </div>
                <div className="info-tile">
                  <span className="info-label">Department</span>
                  <span className="info-val">{selectedTeacher.department}</span>
                </div>
                <div className="info-tile">
                  <span className="info-label">Joining Date</span>
                  <span className="info-val">
                    {new Date(selectedTeacher.joiningDate || selectedTeacher.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-tile full-width">
                  <span className="info-label">Office / Residential Address</span>
                  <span className="info-val">{selectedTeacher.address || '78 University Boulevard, North District'}</span>
                </div>
                <div className="info-tile full-width">
                  <span className="info-label">Faculty Biography & Research Focus</span>
                  <span className="info-val">{selectedTeacher.bio || 'Dedicated educator and mentor.'}</span>
                </div>
              </div>

              {/* Assignments Breakdown Box */}
              <div className="card" style={{ marginTop: '1rem', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>📚 Current Teaching Allocations</h4>
                  <button
                    onClick={() => {
                      const t = selectedTeacher;
                      openAssignModal(t);
                    }}
                    className="btn btn-outline-primary btn-sm"
                  >
                    + Modify Allocations
                  </button>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="info-label">Assigned Classes:</span>
                  <div className="assignment-pills-row" style={{ marginTop: '0.25rem' }}>
                    {(selectedTeacher.assignedClasses || []).map((cls, idx) => (
                      <span key={idx} className="badge badge-student">{cls}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="info-label">Assigned Subjects / Courses:</span>
                  <div className="assignment-pills-row" style={{ marginTop: '0.25rem' }}>
                    {(selectedTeacher.assignedSubjects || []).map((sub, idx) => (
                      <span key={idx} className="badge badge-teacher">{sub}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                onClick={() => {
                  const t = selectedTeacher;
                  setSelectedTeacher(null);
                  openEditModal(t);
                }}
                className="btn btn-outline-primary"
              >
                ✏️ Edit Faculty Info
              </button>
              <button onClick={() => setSelectedTeacher(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          4. ASSIGN CLASSES & SUBJECTS MODAL
         ========================================================= */}
      {showAssignModal && selectedTeacher && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <div>
                <h3>📚 Course & Class Assignments</h3>
                <p className="subtitle">Configuring teaching load for <strong>{selectedTeacher.name}</strong></p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSaveAssignments} className="modal-form">
              {/* Classes Checkbox Grid */}
              <div className="form-section-header">1. Select Assigned Classes & Sections</div>
              <div className="checkboxes-selection-grid">
                {ALL_AVAILABLE_CLASSES.map((cls) => {
                  const isChecked = assigningClasses.includes(cls);
                  return (
                    <label key={cls} className={`checkbox-card ${isChecked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleClassSelection(cls)}
                      />
                      <span>🏫 {cls}</span>
                    </label>
                  );
                })}
              </div>

              {/* Subjects Checkbox Grid */}
              <div className="form-section-header" style={{ marginTop: '1rem' }}>
                2. Select Assigned Subjects & Courses
              </div>
              <div className="checkboxes-selection-grid">
                {ALL_AVAILABLE_SUBJECTS.map((sub) => {
                  const isChecked = assigningSubjects.includes(sub);
                  return (
                    <label key={sub} className={`checkbox-card ${isChecked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSubjectSelection(sub)}
                      />
                      <span>📖 {sub}</span>
                    </label>
                  );
                })}
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Save Class & Subject Allocations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          5. ADD / EDIT TEACHER MODAL
         ========================================================= */}
      {(showAddModal || showEditModal) && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3>{showAddModal ? '👨‍🏫 Onboard New Faculty Member' : `✏️ Edit Faculty: ${teacherForm.name}`}</h3>
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

            <form onSubmit={showAddModal ? handleAddTeacher : handleEditTeacher} className="modal-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCH-006"
                    value={teacherForm.employeeId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, employeeId: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Goodall"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@school.com"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Department *</label>
                  <select
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="form-control"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Qualification & Degrees</label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D Biology, M.Ed"
                    value={teacherForm.qualification}
                    onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    value={teacherForm.experienceYears}
                    onChange={(e) => setTeacherForm({ ...teacherForm, experienceYears: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1-555-0119"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Faculty Status</label>
                  <select
                    value={teacherForm.status}
                    onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Biography & Specialization</label>
                <textarea
                  rows="3"
                  placeholder="Short bio and pedagogical interests..."
                  value={teacherForm.bio}
                  onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                  className="form-control"
                ></textarea>
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
                  {showAddModal ? 'Save & Onboard Faculty' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersModule;

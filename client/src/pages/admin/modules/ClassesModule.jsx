import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const ClassesModule = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'tree'

  // Modals
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAllocateSubjectModal, setShowAllocateSubjectModal] = useState(false);
  const [showChangeClassTeacherModal, setShowChangeClassTeacherModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Forms
  const [classForm, setClassForm] = useState({
    name: 'Class 10',
    section: 'Section C',
    roomNumber: 'Room 103',
    capacity: 40,
    classTeacher: 'Unassigned',
  });

  const [subjectAllocationForm, setSubjectAllocationForm] = useState({
    subjectName: 'Mathematics',
    subjectCode: 'MTH-101',
    teacherName: '',
    credits: 4,
    weeklyPeriods: 5,
  });

  const [selectedClassTeacher, setSelectedClassTeacher] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, teachersRes, subjectsRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/teachers'),
        api.get('/admin/subjects'),
      ]);

      if (classesRes.data.success) setClasses(classesRes.data.classes);
      if (teachersRes.data.success) setTeachers(teachersRes.data.teachers);
      if (subjectsRes.data.success) setMasterSubjects(subjectsRes.data.subjects);
    } catch (err) {
      console.error('Failed to fetch class hierarchy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create Class Handler
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/classes', classForm);
      if (res.data.success) {
        setShowAddClassModal(false);
        setClassForm({
          name: 'Class 10',
          section: 'Section C',
          roomNumber: 'Room 103',
          capacity: 40,
          classTeacher: 'Unassigned',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating class');
    }
  };

  // Assign / Update Class Teacher
  const handleUpdateClassTeacher = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      const res = await api.patch(`/admin/classes/${selectedClass._id}/class-teacher`, {
        classTeacher: selectedClassTeacher,
      });
      if (res.data.success) {
        setShowChangeClassTeacherModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Failed to update class teacher');
    }
  };

  // Allocate Subject & Teacher to Class
  const handleAllocateSubject = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      const res = await api.post(`/admin/classes/${selectedClass._id}/subjects`, subjectAllocationForm);
      if (res.data.success) {
        setShowAllocateSubjectModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error allocating subject to class');
    }
  };

  // Remove Subject from Class
  const handleRemoveSubject = async (classId, subjectCode) => {
    if (!window.confirm(`Remove ${subjectCode} from this section?`)) return;
    try {
      const res = await api.delete(`/admin/classes/${classId}/subjects/${subjectCode}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to remove subject');
    }
  };

  // Delete Class Section
  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entire class section?')) return;
    try {
      await api.delete(`/admin/classes/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete class');
    }
  };

  const openAllocateModal = (cls) => {
    setSelectedClass(cls);
    const defaultSub = masterSubjects[0] || { name: 'Mathematics', code: 'MTH-101', credits: 4 };
    const defaultTeacher = teachers[0]?.name || 'Unassigned';
    setSubjectAllocationForm({
      subjectName: defaultSub.name,
      subjectCode: defaultSub.code,
      teacherName: defaultTeacher,
      credits: defaultSub.credits || 4,
      weeklyPeriods: defaultSub.weeklyPeriods || 5,
    });
    setShowAllocateSubjectModal(true);
  };

  const openTeacherModal = (cls) => {
    setSelectedClass(cls);
    setSelectedClassTeacher(cls.classTeacher || (teachers[0]?.name || 'Unassigned'));
    setShowChangeClassTeacherModal(true);
  };

  // Group classes by grade name for Tree View
  const groupedClasses = classes.reduce((acc, cls) => {
    const key = cls.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cls);
    return acc;
  }, {});

  return (
    <div className="module-view-container">
      {/* 1. Header & View Toggle Controls */}
      <div className="module-controls-bar">
        <div>
          <h3>Class & Section Curriculum Management</h3>
          <p className="subtitle">
            Manage class sections, designated class teachers, and subject-to-teacher mappings
          </p>
        </div>

        <div className="search-filter-group">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              🗂️ Cards View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
            >
              🌳 Hierarchy Tree View
            </button>
          </div>

          <button onClick={() => setShowAddClassModal(true)} className="btn btn-primary">
            + Create Class Section
          </button>
        </div>
      </div>

      {loading ? (
        <div className="module-loading">Loading class & curriculum hierarchy...</div>
      ) : viewMode === 'tree' ? (
        /* =========================================================
           2. HIERARCHY TREE VIEW (Exact structure requested by user!)
           ========================================================= */
        <div className="card hierarchy-tree-card">
          <div className="tree-header">
            <h4>🌳 Institutional Academic Hierarchy Tree</h4>
            <span className="badge badge-primary">Class ➔ Section ➔ Class Teacher ➔ [Subject ➔ Teacher]</span>
          </div>

          <div className="hierarchy-tree-root">
            {Object.keys(groupedClasses).map((gradeName) => (
              <div key={gradeName} className="tree-class-block">
                {/* Level 1: Class / Grade */}
                <div className="tree-node tree-node-class">
                  <span className="tree-node-icon">🏫</span>
                  <span className="tree-node-title"><strong>{gradeName}</strong></span>
                  <span className="tree-node-badge">{groupedClasses[gradeName].length} Sections</span>
                </div>

                {/* Level 2: Sections */}
                <div className="tree-sections-container">
                  {groupedClasses[gradeName].map((sectionItem) => (
                    <div key={sectionItem._id} className="tree-section-branch">
                      <div className="tree-node tree-node-section">
                        <div className="tree-section-title-row">
                          <span className="tree-node-icon">📍</span>
                          <span className="tree-section-title">
                            <strong>{sectionItem.section}</strong> ({sectionItem.roomNumber})
                          </span>
                          <span className="class-teacher-pill">
                            👨‍🏫 Class Teacher: <strong>{sectionItem.classTeacher || 'Unassigned'}</strong>
                          </span>
                        </div>

                        <button
                          onClick={() => openAllocateModal(sectionItem)}
                          className="btn btn-outline-primary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          + Allocate Subject
                        </button>
                      </div>

                      {/* Level 3: Subject -> Teacher Mapping */}
                      <div className="tree-subjects-container">
                        {(sectionItem.subjects && sectionItem.subjects.length > 0) ? (
                          sectionItem.subjects.map((subj, sIdx) => (
                            <div key={sIdx} className="tree-node tree-node-subject">
                              <div className="tree-subject-info">
                                <span className="tree-subject-name">📖 {subj.subjectName}</span>
                                <span className="code-pill">{subj.subjectCode}</span>
                              </div>
                              <div className="tree-arrow">➔</div>
                              <div className="tree-teacher-badge">
                                👨‍🏫 <strong>{subj.teacherName}</strong>
                              </div>
                              <button
                                onClick={() => handleRemoveSubject(sectionItem._id, subj.subjectCode)}
                                className="btn-icon-danger"
                                title="Remove Subject"
                              >
                                🗑️
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="tree-no-subjects">
                            No subjects allocated yet. Click "+ Allocate Subject" above.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* =========================================================
           3. INTERACTIVE CARDS GRID VIEW
           ========================================================= */
        <div className="classes-grid">
          {classes.map((cls) => {
            const occupancy = Math.round(((cls.studentsCount || 30) / (cls.capacity || 40)) * 100);
            return (
              <div key={cls._id} className="card class-card-detailed">
                {/* Card Top */}
                <div className="class-card-header">
                  <div>
                    <h3 className="class-title">{cls.name} — {cls.section}</h3>
                    <span className="room-badge">📍 {cls.roomNumber || 'Room 101'}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteClass(cls._id)}
                    className="btn-icon-danger"
                    title="Delete Class"
                  >
                    🗑️
                  </button>
                </div>

                {/* Class Teacher Bar */}
                <div className="class-teacher-banner">
                  <div className="class-teacher-info">
                    <span className="class-teacher-label">Class Teacher:</span>
                    <strong className="class-teacher-name">{cls.classTeacher || 'Unassigned'}</strong>
                  </div>
                  <button
                    onClick={() => openTeacherModal(cls)}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Change Teacher
                  </button>
                </div>

                {/* Occupancy Progress */}
                <div className="occupancy-section">
                  <div className="occupancy-labels">
                    <span>Student Enrollment</span>
                    <span><strong>{cls.studentsCount || 32}</strong> / {cls.capacity || 40} ({occupancy}%)</span>
                  </div>
                  <div className="occupancy-bar-track">
                    <div
                      className="occupancy-bar-fill"
                      style={{
                        width: `${occupancy}%`,
                        backgroundColor: occupancy > 90 ? '#ef4444' : '#4f46e5',
                      }}
                    ></div>
                  </div>
                </div>

                {/* Subject & Teacher Mapping Table */}
                <div className="class-subjects-table-container">
                  <div className="subjects-table-header">
                    <span>Curriculum Subjects ({cls.subjects?.length || 0})</span>
                    <button
                      onClick={() => openAllocateModal(cls)}
                      className="btn-link"
                      style={{ fontSize: '0.8rem' }}
                    >
                      + Allocate Subject
                    </button>
                  </div>

                  {cls.subjects && cls.subjects.length > 0 ? (
                    <div className="subjects-allocation-list">
                      {cls.subjects.map((s, idx) => (
                        <div key={idx} className="subject-allocation-row">
                          <div className="subject-col">
                            <strong>{s.subjectName}</strong>
                            <span className="code-pill">{s.subjectCode}</span>
                          </div>
                          <div className="teacher-col">
                            <span className="teacher-arrow">➔</span>
                            <span className="assigned-teacher-badge">👨‍🏫 {s.teacherName}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveSubject(cls._id, s.subjectCode)}
                            className="btn-icon-danger"
                            title="Remove Subject"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-subjects-box">
                      No subjects mapped. Click "+ Allocate Subject" to add courses.
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="class-card-footer">
                  <button
                    onClick={() => openAllocateModal(cls)}
                    className="btn btn-primary btn-block btn-sm"
                  >
                    + Assign Subject & Teacher
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          4. ALLOCATE SUBJECT & TEACHER MODAL
         ========================================================= */}
      {showAllocateSubjectModal && selectedClass && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h3>📖 Allocate Subject to Class</h3>
                <p className="subtitle">
                  Assigning course to <strong>{selectedClass.name} - {selectedClass.section}</strong>
                </p>
              </div>
              <button onClick={() => setShowAllocateSubjectModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleAllocateSubject} className="modal-form">
              <div className="form-group">
                <label>Select Master Curriculum Subject *</label>
                <select
                  value={subjectAllocationForm.subjectCode}
                  onChange={(e) => {
                    const selected = masterSubjects.find((s) => s.code === e.target.value);
                    if (selected) {
                      setSubjectAllocationForm({
                        ...subjectAllocationForm,
                        subjectCode: selected.code,
                        subjectName: selected.name,
                        credits: selected.credits || 4,
                      });
                    }
                  }}
                  className="form-control"
                >
                  {masterSubjects.map((ms) => (
                    <option key={ms._id} value={ms.code}>
                      {ms.name} ({ms.code}) — {ms.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assign Specific Subject Teacher *</label>
                <select
                  value={subjectAllocationForm.teacherName}
                  onChange={(e) => setSubjectAllocationForm({ ...subjectAllocationForm, teacherName: e.target.value })}
                  className="form-control"
                  required
                >
                  <option value="">-- Choose Instructor --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t.name}>
                      👨‍🏫 {t.name} ({t.department} - {t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Credits</label>
                  <input
                    type="number"
                    value={subjectAllocationForm.credits}
                    onChange={(e) => setSubjectAllocationForm({ ...subjectAllocationForm, credits: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Weekly Periods</label>
                  <input
                    type="number"
                    value={subjectAllocationForm.weeklyPeriods}
                    onChange={(e) => setSubjectAllocationForm({ ...subjectAllocationForm, weeklyPeriods: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAllocateSubjectModal(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Allocate Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          5. CHANGE CLASS TEACHER MODAL
         ========================================================= */}
      {showChangeClassTeacherModal && selectedClass && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>👨‍🏫 Assign Class Teacher</h3>
              <button onClick={() => setShowChangeClassTeacherModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleUpdateClassTeacher} className="modal-form">
              <p>
                Designate a primary faculty mentor for <strong>{selectedClass.name} - {selectedClass.section}</strong>.
              </p>

              <div className="form-group">
                <label>Select Faculty Member *</label>
                <select
                  value={selectedClassTeacher}
                  onChange={(e) => setSelectedClassTeacher(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="Unassigned">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t.name}>
                      👨‍🏫 {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowChangeClassTeacherModal(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Class Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          6. CREATE CLASS MODAL
         ========================================================= */}
      {showAddClassModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>🏫 Create New Class Section</h3>
              <button onClick={() => setShowAddClassModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleCreateClass} className="modal-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Class / Grade *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10, Grade 11"
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A, Section B"
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 104"
                    value={classForm.roomNumber}
                    onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    required
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Designated Class Teacher</label>
                <select
                  value={classForm.classTeacher}
                  onChange={(e) => setClassForm({ ...classForm, classTeacher: e.target.value })}
                  className="form-control"
                >
                  <option value="Unassigned">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t.name}>
                      👨‍🏫 {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Class Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesModule;

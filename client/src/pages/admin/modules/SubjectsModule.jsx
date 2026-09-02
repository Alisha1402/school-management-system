import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const SubjectsModule = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const initialSubjectForm = {
    name: '',
    code: '',
    department: 'Sciences',
    credits: 4,
    weeklyPeriods: 5,
    description: '',
  };
  const [subjectForm, setSubjectForm] = useState(initialSubjectForm);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/subjects');
      if (res.data.success) {
        setSubjects(res.data.subjects);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/subjects', subjectForm);
      if (res.data.success) {
        setShowAddModal(false);
        setSubjectForm(initialSubjectForm);
        fetchSubjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating subject');
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/subjects/${subjectForm._id}`, subjectForm);
      if (res.data.success) {
        setShowEditModal(false);
        fetchSubjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course from the master catalog?')) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete subject');
    }
  };

  const openEditModal = (sub) => {
    setSubjectForm(sub);
    setShowEditModal(true);
  };

  const filteredSubjects = subjects.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchLower) ||
      s.code.toLowerCase().includes(searchLower) ||
      s.department.toLowerCase().includes(searchLower);

    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="module-view-container">
      {/* 1. Header & Controls */}
      <div className="module-controls-bar">
        <div className="search-filter-group">
          <input
            type="text"
            placeholder="🔍 Search course name, code, department..."
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
            <option value="Sciences">Sciences</option>
            <option value="Languages">Languages</option>
            <option value="Technology">Technology</option>
            <option value="Humanities">Humanities</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSubjectForm(initialSubjectForm);
            setShowAddModal(true);
          }}
          className="btn btn-primary"
        >
          + Add Curriculum Course
        </button>
      </div>

      {/* 2. Subjects Master Catalog Table */}
      <div className="table-responsive card">
        {loading ? (
          <div className="module-loading">Loading curriculum courses...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course / Subject Name</th>
                <th>Department</th>
                <th>Credit Units</th>
                <th>Weekly Periods</th>
                <th>Course Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <span className="code-pill">{sub.code}</span>
                    </td>
                    <td>
                      <strong>{sub.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-teacher">{sub.department}</span>
                    </td>
                    <td>
                      <span className="credits-pill">{sub.credits || 4} Credits</span>
                    </td>
                    <td>
                      <strong>{sub.weeklyPeriods || 5}</strong> hrs/week
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '0.825rem' }}>
                        {sub.description || 'Core curriculum studies.'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="btn-action-icon"
                          title="Edit Course"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub._id)}
                          className="btn-action-icon text-danger"
                          title="Delete Course"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-msg">
                    No curriculum subjects found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Add / Edit Subject Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{showAddModal ? '📚 Add Master Curriculum Course' : `✏️ Edit Course: ${subjectForm.name}`}</h3>
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

            <form onSubmit={showAddModal ? handleAddSubject : handleEditSubject} className="modal-form">
              <div className="form-group">
                <label>Course / Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Molecular Biology"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIO-301"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Department</label>
                  <select
                    value={subjectForm.department}
                    onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
                    className="form-control"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Languages">Languages</option>
                    <option value="Technology">Technology</option>
                    <option value="Humanities">Humanities</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Academic Credits</label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Weekly Periods</label>
                  <input
                    type="number"
                    value={subjectForm.weeklyPeriods}
                    onChange={(e) => setSubjectForm({ ...subjectForm, weeklyPeriods: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Course Description & Objectives</label>
                <textarea
                  rows="3"
                  placeholder="Outline syllabus topics and laboratory prerequisites..."
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
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
                  {showAddModal ? 'Save Course to Catalog' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsModule;

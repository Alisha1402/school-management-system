import React from 'react';
import AdminSidebar from './AdminSidebar';

const tabTitles = {
  dashboard: { title: 'Admin Overview', subtitle: 'Real-time school telemetry, statistics, and live activity' },
  students: { title: 'Students Directory', subtitle: 'Manage student records, enrollments, and academic status' },
  teachers: { title: 'Faculty & Teachers', subtitle: 'Instructor directory, departments, and assigned subjects' },
  classes: { title: 'Classes & Sections', subtitle: 'Classrooms, seating capacities, and class teacher allocations' },
  subjects: { title: 'Curriculum & Subjects', subtitle: 'Course codes, syllabi, and faculty assignments' },
  attendance: { title: 'Daily Attendance Tracker', subtitle: 'School-wide attendance logs and absence analytics' },
  assignments: { title: 'Assignments & Homework', subtitle: 'Class coursework submissions, deadlines, and review status' },
  notices: { title: 'Notice Board & Announcements', subtitle: 'Publish circulars to students, teachers, or all staff' },
  complaints: { title: 'Complaints & Grievances Desk', subtitle: 'Review, track, and resolve community feedback' },
  exams: { title: 'Examinations Schedule', subtitle: 'Term finals, test slots, and room arrangements' },
  results: { title: 'Academic Results & Grading', subtitle: 'Grade sheets, student GPA averages, and pass rate analytics' },
  fees: { title: 'Fee Management & Invoices', subtitle: 'Tuition revenue, pending collections, and payment history' },
  leaves: { title: 'Leave Requests & Approvals', subtitle: 'Review faculty and student leave applications' },
  timetable: { title: 'School Timetable Matrix', subtitle: 'Weekly schedules, periods, and room allocations' },
  reports: { title: 'Reports & Analytics', subtitle: 'Exportable academic performance and financial statements' },
  settings: { title: 'System & School Settings', subtitle: 'Configure institution details, academic sessions, and preferences' },
};

const AdminLayout = ({ activeTab, setActiveTab, counts, children }) => {
  const current = tabTitles[activeTab] || { title: 'Admin Panel', subtitle: 'School Management' };

  return (
    <div className="admin-layout-container">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
      
      <main className="admin-main-viewport">
        <header className="admin-view-header">
          <div>
            <div className="admin-breadcrumb">
              <span>Admin</span> / <span className="current-page">{current.title}</span>
            </div>
            <h1 className="admin-view-title">{current.title}</h1>
            <p className="admin-view-subtitle">{current.subtitle}</p>
          </div>

          <div className="admin-header-actions">
            <div className="admin-date-badge">
              📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="admin-content-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

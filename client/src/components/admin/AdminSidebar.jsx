import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, counts = {} }) => {
  const menuGroups = [
    {
      label: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      label: 'ACADEMIC',
      items: [
        { id: 'students', label: 'Students', icon: '🎓', count: counts.students },
        { id: 'teachers', label: 'Teachers', icon: '👨‍🏫', count: counts.teachers },
        { id: 'classes', label: 'Classes', icon: '🏫', count: counts.classes },
        { id: 'subjects', label: 'Subjects', icon: '📚', count: counts.subjects },
        { id: 'timetable', label: 'Timetable', icon: '⏱️' },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { id: 'attendance', label: 'Attendance', icon: '📅' },
        { id: 'assignments', label: 'Assignments', icon: '📝' },
        { id: 'exams', label: 'Exams', icon: '📑' },
        { id: 'results', label: 'Results', icon: '🏆' },
      ],
    },
    {
      label: 'ADMINISTRATION',
      items: [
        { id: 'fees', label: 'Fees', icon: '💳' },
        { id: 'leaves', label: 'Leaves', icon: '🏖️', badge: counts.pendingLeaves, badgeType: 'warning' },
        { id: 'complaints', label: 'Complaints', icon: '💬', badge: counts.pendingComplaints, badgeType: 'danger' },
        { id: 'notices', label: 'Notices', icon: '📢', count: counts.notices },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'reports', label: 'Reports', icon: '📈' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">🛡️</span>
          <div>
            <div className="sidebar-brand-title">Admin Console</div>
            <div className="sidebar-brand-sub">School Control Panel</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-title">{group.label}</div>
            <ul className="sidebar-menu">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <span className="sidebar-icon">{item.icon}</span>
                      <span className="sidebar-label">{item.label}</span>
                      
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`sidebar-badge badge-${item.badgeType || 'info'}`}>
                          {item.badge}
                        </span>
                      )}

                      {item.count !== undefined && item.count > 0 && (
                        <span className="sidebar-count">{item.count}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

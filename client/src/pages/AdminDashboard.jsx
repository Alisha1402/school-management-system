import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/admin/AdminLayout';
import AdminOverview from './admin/AdminOverview';
import StudentsModule from './admin/modules/StudentsModule';
import TeachersModule from './admin/modules/TeachersModule';
import ClassesModule from './admin/modules/ClassesModule';
import SubjectsModule from './admin/modules/SubjectsModule';
import AttendanceModule from './admin/modules/AttendanceModule';
import NoticesModule from './admin/modules/NoticesModule';
import ComplaintsModule from './admin/modules/ComplaintsModule';
import FeesModule from './admin/modules/FeesModule';
import LeavesModule from './admin/modules/LeavesModule';
import {
  AssignmentsModule,
  ExamsModule,
  ResultsModule,
  TimetableModule,
  ReportsModule,
  SettingsModule,
} from './admin/modules/AcademicModules';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const counts = {
    students: statsData?.stats?.totalStudents || 1248,
    teachers: statsData?.stats?.totalTeachers || 84,
    classes: statsData?.stats?.totalClasses || 6,
    subjects: statsData?.stats?.totalSubjects || 6,
    notices: statsData?.stats?.totalNotices || 4,
    pendingComplaints: statsData?.stats?.pendingComplaints || 1,
    pendingLeaves: statsData?.stats?.pendingLeaves || 2,
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminOverview
            stats={statsData?.stats}
            charts={statsData?.charts}
            recentActivities={statsData?.recentActivities}
            recentNotices={statsData?.recentNotices}
            recentLeaves={statsData?.recentLeaves}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'students':
        return <StudentsModule />;
      case 'teachers':
        return <TeachersModule />;
      case 'classes':
        return <ClassesModule />;
      case 'subjects':
        return <SubjectsModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'assignments':
        return <AssignmentsModule />;
      case 'notices':
        return <NoticesModule />;
      case 'complaints':
        return <ComplaintsModule />;
      case 'exams':
        return <ExamsModule />;
      case 'results':
        return <ResultsModule />;
      case 'fees':
        return <FeesModule />;
      case 'leaves':
        return <LeavesModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <AdminOverview stats={statsData?.stats} onNavigate={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} counts={counts}>
      {renderActiveModule()}
    </AdminLayout>
  );
};

export default AdminDashboard;

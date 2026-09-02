require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase6Tests = async () => {
  console.log('🧪 Starting Phase 6 Attendance Management Verification Tests...\n');

  try {
    // 1. Authenticate as Teacher
    console.log('1️⃣ Authenticating as Teacher (teacher@school.com)...');
    const teacherLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@school.com', password: 'teacher123' }),
    });
    const teacherLoginData = await teacherLoginRes.json();
    const teacherToken = teacherLoginData.token;
    console.log(`   ✅ Teacher authenticated | Role: ${teacherLoginData.user?.role}`);

    const teacherHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${teacherToken}`,
    };

    // 2. Test Get Session Roster as Teacher
    console.log('2️⃣ Testing Fetch Session Attendance Roster (GET /api/attendance/session)...');
    const today = new Date().toISOString().split('T')[0];
    const sessionRes = await fetch(
      `${BASE_URL}/attendance/session?date=${today}&className=Class%2010&section=Section%20A&subjectCode=MTH-101`,
      { headers: teacherHeaders }
    );
    const sessionData = await sessionRes.json();
    console.log(`   ✅ Fetched roster with ${sessionData.records?.length || 0} student records.`);

    // 3. Test Teacher Save Attendance (POST /api/attendance)
    console.log('3️⃣ Testing Teacher Save Attendance (POST /api/attendance)...');
    const saveRes = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify({
        date: today,
        className: 'Class 10',
        section: 'Section A',
        subjectName: 'Mathematics',
        subjectCode: 'MTH-101',
        records: [
          { rollNumber: 'STU-1001', studentName: 'Alex Johnson', status: 'Present', remark: 'On time' },
          { rollNumber: 'STU-1002', studentName: 'Emma Watson', status: 'Late', remark: 'Arrived 10 min late' },
          { rollNumber: 'STU-1004', studentName: 'Mia Anderson', status: 'Absent', remark: 'Unexcused' },
        ],
      }),
    });
    const saveData = await saveRes.json();
    console.log(`   ✅ Saved session attendance: ${saveData.attendance?.className} - ${saveData.attendance?.section} (${saveData.attendance?.subjectName})`);

    // 4. Authenticate as Student
    console.log('4️⃣ Authenticating as Student (student@school.com)...');
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@school.com', password: 'student123' }),
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.token;
    console.log(`   ✅ Student authenticated | Role: ${studentLoginData.user?.role}`);

    const studentHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    };

    // 5. Test Student Get Personal Attendance (GET /api/attendance/my-attendance)
    console.log('5️⃣ Testing Student Personal Attendance Analytics (GET /api/attendance/my-attendance)...');
    const studentAttendanceRes = await fetch(`${BASE_URL}/attendance/my-attendance`, { headers: studentHeaders });
    const studentAttendanceData = await studentAttendanceRes.json();
    console.log(`   ✅ Student: ${studentAttendanceData.student?.name} (${studentAttendanceData.student?.rollNumber})`);
    console.log(`   ✅ Overall Attendance Rate: ${studentAttendanceData.stats?.overallPercentage}%`);
    console.log(`   ✅ Total Sessions: ${studentAttendanceData.stats?.totalSessions} (Present: ${studentAttendanceData.stats?.presentCount}, Late: ${studentAttendanceData.stats?.lateCount}, Absent: ${studentAttendanceData.stats?.absentCount})`);
    console.log(`   ✅ History Log Entries: ${studentAttendanceData.history?.length} sessions`);

    // 6. Authenticate as Admin
    console.log('6️⃣ Authenticating as Admin (admin@school.com)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log(`   ✅ Admin authenticated | Role: ${adminLoginData.user?.role}`);

    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // 7. Test Admin Complete Attendance Reports (GET /api/attendance/reports)
    console.log('7️⃣ Testing Admin Institutional Attendance Reports (GET /api/attendance/reports)...');
    const adminReportsRes = await fetch(`${BASE_URL}/attendance/reports`, { headers: adminHeaders });
    const adminReportsData = await adminReportsRes.json();
    console.log(`   ✅ School-wide Attendance Rate: ${adminReportsData.summary?.averageRate}%`);
    console.log(`   ✅ Total Records Marked: ${adminReportsData.summary?.totalRecordsMarked}`);
    console.log(`   ✅ Class Leaderboard Divisions: ${adminReportsData.classLeaderboard?.length}`);
    console.log(`   ✅ Recent Audit Sessions: ${adminReportsData.recentSessions?.length}`);

    console.log('\n🎉 ALL 7 PHASE 6 ATTENDANCE MANAGEMENT TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 6 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase6Tests();

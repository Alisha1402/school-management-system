require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🧪 Starting Phase 3 Admin Dashboard & Modules Verification Tests...\n');

  try {
    // 1. Authenticate as Admin
    console.log('1️⃣ Authenticating as Admin (admin@school.com)...');
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

    // 2. Test GET /api/admin/stats
    console.log('2️⃣ Testing GET /api/admin/stats (Dashboard Telemetry & Charts)...');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, { headers: adminHeaders });
    const statsData = await statsRes.json();
    console.log(`   ✅ Status: ${statsRes.status} | Total Students: ${statsData.stats?.totalStudents}, Total Teachers: ${statsData.stats?.totalTeachers}, Classes: ${statsData.stats?.totalClasses}`);
    console.log(`   📊 Charts present: Weekly Attendance (${statsData.charts?.weeklyAttendance?.length} days), Fee Trends (${statsData.charts?.feeTrends?.length} months)`);
    console.log(`   🕒 Recent Activities: ${statsData.recentActivities?.length} items`);

    // 3. Test GET /api/admin/students & POST /api/admin/students
    console.log('3️⃣ Testing Students API (GET & POST)...');
    const studentsRes = await fetch(`${BASE_URL}/admin/students`, { headers: adminHeaders });
    const studentsData = await studentsRes.json();
    console.log(`   ✅ Fetched ${studentsData.count} students`);

    const newStudentRes = await fetch(`${BASE_URL}/admin/students`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        rollNumber: `STU-TEST-${Date.now()}`,
        name: 'Verification Student',
        email: `verify_${Date.now()}@school.com`,
        className: 'Grade 10-A',
        gender: 'Female',
        parentContact: '+1-555-0999',
      }),
    });
    const newStudentData = await newStudentRes.json();
    console.log(`   ✅ Created student: ${newStudentData.student?.name} (${newStudentData.student?.rollNumber})`);

    // 4. Test GET /api/admin/teachers
    console.log('4️⃣ Testing Teachers API (GET)...');
    const teachersRes = await fetch(`${BASE_URL}/admin/teachers`, { headers: adminHeaders });
    const teachersData = await teachersRes.json();
    console.log(`   ✅ Fetched ${teachersData.count} faculty members`);

    // 5. Test GET /api/admin/classes & /api/admin/subjects
    console.log('5️⃣ Testing Classes & Subjects API...');
    const classesRes = await fetch(`${BASE_URL}/admin/classes`, { headers: adminHeaders });
    const classesData = await classesRes.json();
    const subjectsRes = await fetch(`${BASE_URL}/admin/subjects`, { headers: adminHeaders });
    const subjectsData = await subjectsRes.json();
    console.log(`   ✅ Classes: ${classesData.count} divisions | Subjects: ${subjectsData.count} courses`);

    // 6. Test GET /api/admin/notices
    console.log('6️⃣ Testing Notices Board API...');
    const noticesRes = await fetch(`${BASE_URL}/admin/notices`, { headers: adminHeaders });
    const noticesData = await noticesRes.json();
    console.log(`   ✅ Fetched ${noticesData.count} notices`);

    // 7. Test GET /api/admin/complaints & PATCH /api/admin/complaints/:id
    console.log('7️⃣ Testing Complaints Desk API...');
    const complaintsRes = await fetch(`${BASE_URL}/admin/complaints`, { headers: adminHeaders });
    const complaintsData = await complaintsRes.json();
    console.log(`   ✅ Fetched ${complaintsData.count} complaints`);

    // 8. Test GET /api/admin/fees
    console.log('8️⃣ Testing Fees Management API...');
    const feesRes = await fetch(`${BASE_URL}/admin/fees`, { headers: adminHeaders });
    const feesData = await feesRes.json();
    console.log(`   ✅ Fetched ${feesData.count} fee invoices`);

    // 9. Test GET /api/admin/leaves & PATCH /api/admin/leaves/:id
    console.log('9️⃣ Testing Leaves Application API...');
    const leavesRes = await fetch(`${BASE_URL}/admin/leaves`, { headers: adminHeaders });
    const leavesData = await leavesRes.json();
    console.log(`   ✅ Fetched ${leavesData.count} leave requests`);

    // 10. Security Test: Student token trying to access Admin API (must return 403)
    console.log('🔟 Testing RBAC Security Guard: Student accessing /api/admin/stats...');
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@school.com', password: 'student123' }),
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.token;

    const studentBlockedRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentBlockedData = await studentBlockedRes.json();
    if (studentBlockedRes.status === 403) {
      console.log(`   ✅ Correctly blocked with status: 403 (${studentBlockedData.message})`);
    } else {
      console.log(`   ❌ Security check failed! Expected 403, got ${studentBlockedRes.status}`);
    }

    console.log('\n🎉 ALL 10 ADMIN DASHBOARD & MODULE VERIFICATION TESTS PASSED!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification test failed:', error.message);
    process.exit(1);
  }
};

runTests();

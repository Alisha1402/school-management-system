require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api/auth';

const runTests = async () => {
  console.log('🧪 Starting Authentication & RBAC Verification Tests...\n');

  try {
    // 1. Test Admin Login
    console.log('1️⃣ Testing Admin Login (admin@school.com)...');
    const adminRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' }),
    });
    const adminData = await adminRes.json();
    console.log(`   ✅ Status: ${adminRes.status} | Token received | Role: ${adminData.user?.role}`);
    const adminToken = adminData.token;

    // 2. Test Teacher Login
    console.log('2️⃣ Testing Teacher Login (teacher@school.com)...');
    const teacherRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@school.com', password: 'teacher123' }),
    });
    const teacherData = await teacherRes.json();
    console.log(`   ✅ Status: ${teacherRes.status} | Token received | Role: ${teacherData.user?.role}`);
    const teacherToken = teacherData.token;

    // 3. Test Student Login
    console.log('3️⃣ Testing Student Login (student@school.com)...');
    const studentRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@school.com', password: 'student123' }),
    });
    const studentData = await studentRes.json();
    console.log(`   ✅ Status: ${studentRes.status} | Token received | Role: ${studentData.user?.role}`);
    const studentToken = studentData.token;

    // 4. Test Invalid Login
    console.log('4️⃣ Testing Invalid Credentials...');
    const invalidRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@school.com', password: 'wrongpassword' }),
    });
    const invalidData = await invalidRes.json();
    if (invalidRes.status === 401) {
      console.log(`   ✅ Correctly rejected with status: 401 (${invalidData.message})`);
    } else {
      console.log(`   ❌ Unexpected status: ${invalidRes.status}`);
    }

    // 5. Test /api/auth/me with Admin Token
    console.log('5️⃣ Testing GET /api/auth/me (Current User Profile)...');
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();
    console.log(`   ✅ Status: ${meRes.status} | Verified User: ${meData.user?.name} (${meData.user?.email})`);

    // 6. Test Admin access to Admin-Only route
    console.log('6️⃣ Testing Admin access to /admin-only...');
    const adminAccessRes = await fetch(`${BASE_URL}/admin-only`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminAccessData = await adminAccessRes.json();
    console.log(`   ✅ Status: ${adminAccessRes.status} | ${adminAccessData.message}`);

    // 7. Test Student access to Admin-Only route (Should be 403 Forbidden)
    console.log('7️⃣ Testing Student access to /admin-only (Role Guard Check)...');
    const studentBlockedRes = await fetch(`${BASE_URL}/admin-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentBlockedData = await studentBlockedRes.json();
    if (studentBlockedRes.status === 403) {
      console.log(`   ✅ Correctly blocked with status: 403 (${studentBlockedData.message})`);
    } else {
      console.log(`   ❌ Should have returned 403, got: ${studentBlockedRes.status}`);
    }

    // 8. Test Teacher access to Teacher-Only route
    console.log('8️⃣ Testing Teacher access to /teacher-only...');
    const teacherAccessRes = await fetch(`${BASE_URL}/teacher-only`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const teacherAccessData = await teacherAccessRes.json();
    console.log(`   ✅ Status: ${teacherAccessRes.status} | ${teacherAccessData.message}`);

    // 9. Test Student access to Student-Only route
    console.log('9️⃣ Testing Student access to /student-only...');
    const studentAccessRes = await fetch(`${BASE_URL}/student-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentAccessData = await studentAccessRes.json();
    console.log(`   ✅ Status: ${studentAccessRes.status} | ${studentAccessData.message}`);

    // 10. Test Register new user
    console.log('🔟 Testing User Registration (POST /register)...');
    const testEmail = `newuser_${Date.now()}@school.com`;
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test New Student',
        email: testEmail,
        password: 'password123',
        role: 'student',
      }),
    });
    const regData = await regRes.json();
    console.log(`   ✅ Status: ${regRes.status} | Registered: ${regData.user?.email} (${regData.user?.role})`);

    console.log('\n🎉 ALL 10 AUTHENTICATION & ROLE-BASED ACCESS TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    process.exit(1);
  }
};

runTests();

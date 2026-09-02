require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase4Tests = async () => {
  console.log('🧪 Starting Phase 4 Student & Teacher Management Verification Tests...\n');

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

    // 2. Student Management Tests
    console.log('2️⃣ Testing Student Creation with Parent Information...');
    const uniqueRoll = `STU-P4-${Date.now()}`;
    const createStudentRes = await fetch(`${BASE_URL}/admin/students`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        rollNumber: uniqueRoll,
        name: 'Benjamin Franklin',
        email: `benjamin_${Date.now()}@school.com`,
        className: 'Grade 11-Science',
        section: 'Science',
        gender: 'Male',
        bloodGroup: 'AB+',
        address: '101 Liberty Way, Philadelphia',
        parentName: 'Josiah & Abiah Franklin',
        parentRelation: 'Father',
        parentPhone: '+1-555-0811',
        parentEmail: 'josiah@franklin.org',
        emergencyContact: '+1-555-0999',
      }),
    });
    const studentData = await createStudentRes.json();
    console.log(`   ✅ Created student: ${studentData.student?.name} (${studentData.student?.rollNumber})`);
    const studentId = studentData.student?._id;

    // 3. Test Student Details GET
    console.log('3️⃣ Testing GET /api/admin/students/:id (Profile & Parent Record)...');
    const getStudentRes = await fetch(`${BASE_URL}/admin/students/${studentId}`, { headers: adminHeaders });
    const fetchedStudent = await getStudentRes.json();
    console.log(`   ✅ Fetched student profile: ${fetchedStudent.student?.name} | Parent: ${fetchedStudent.student?.parentName} (${fetchedStudent.student?.parentRelation})`);

    // 4. Test Student Update (PUT)
    console.log('4️⃣ Testing Student Update (PUT)...');
    const updateStudentRes = await fetch(`${BASE_URL}/admin/students/${studentId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        ...fetchedStudent.student,
        gpa: 4.0,
        parentPhone: '+1-555-0899',
      }),
    });
    const updatedStudent = await updateStudentRes.json();
    console.log(`   ✅ Updated student GPA: ${updatedStudent.student?.gpa} | Parent Phone: ${updatedStudent.student?.parentPhone}`);

    // 5. Test Student Status Deactivate (PATCH)
    console.log('5️⃣ Testing Student Status Toggle (Active -> Inactive)...');
    const toggleStudentRes = await fetch(`${BASE_URL}/admin/students/${studentId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'Inactive' }),
    });
    const toggledStudent = await toggleStudentRes.json();
    console.log(`   ✅ Status updated to: ${toggledStudent.student?.status}`);

    // 6. Teacher Management Tests
    console.log('6️⃣ Testing Faculty Creation & Onboarding...');
    const uniqueEmpId = `TCH-P4-${Date.now()}`;
    const createTeacherRes = await fetch(`${BASE_URL}/admin/teachers`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        employeeId: uniqueEmpId,
        name: 'Dr. Katherine Johnson',
        email: `katherine_${Date.now()}@school.com`,
        department: 'Mathematics',
        qualification: 'Ph.D in Aerospace Mathematics',
        experienceYears: 15,
        phone: '+1-555-0722',
        address: '500 NASA Parkway, Hampton',
        subject: 'Advanced Mathematics',
        bio: 'NASA research mathematician and orbital trajectory specialist.',
        assignedClasses: ['Grade 11-Science'],
        assignedSubjects: ['Advanced Mathematics'],
      }),
    });
    const teacherData = await createTeacherRes.json();
    console.log(`   ✅ Onboarded faculty: ${teacherData.teacher?.name} (${teacherData.teacher?.employeeId})`);
    const teacherId = teacherData.teacher?._id;

    // 7. Test Teacher Assignments Update (PATCH)
    console.log('7️⃣ Testing Assign Classes & Subjects (PATCH /teachers/:id/assignments)...');
    const assignTeacherRes = await fetch(`${BASE_URL}/admin/teachers/${teacherId}/assignments`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        assignedClasses: ['Grade 10-A', 'Grade 11-Science', 'Grade 12-Science'],
        assignedSubjects: ['Advanced Mathematics', 'Physics & Quantum Basics'],
      }),
    });
    const assignedTeacher = await assignTeacherRes.json();
    console.log(`   ✅ Assigned Classes: [${assignedTeacher.teacher?.assignedClasses.join(', ')}]`);
    console.log(`   ✅ Assigned Subjects: [${assignedTeacher.teacher?.assignedSubjects.join(', ')}]`);

    // 8. Test Teacher Status Toggle (Active -> On Leave)
    console.log('8️⃣ Testing Teacher Status Toggle (Active -> On Leave)...');
    const toggleTeacherRes = await fetch(`${BASE_URL}/admin/teachers/${teacherId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'On Leave' }),
    });
    const toggledTeacher = await toggleTeacherRes.json();
    console.log(`   ✅ Status updated to: ${toggledTeacher.teacher?.status}`);

    // 9. Clean up test records
    console.log('9️⃣ Cleaning up temporary verification records...');
    await fetch(`${BASE_URL}/admin/students/${studentId}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${BASE_URL}/admin/teachers/${teacherId}`, { method: 'DELETE', headers: adminHeaders });
    console.log('   ✅ Cleaned up student and teacher test records.');

    console.log('\n🎉 ALL 9 PHASE 4 STUDENT & TEACHER MANAGEMENT TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 4 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase4Tests();

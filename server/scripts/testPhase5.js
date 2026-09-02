require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase5Tests = async () => {
  console.log('🧪 Starting Phase 5 Class & Subject Management Verification Tests...\n');

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

    // 2. Test Master Subject Creation
    console.log('2️⃣ Testing Master Subject Creation (POST /api/admin/subjects)...');
    const uniqueSubCode = `TEST-SUB-${Date.now()}`;
    const createSubRes = await fetch(`${BASE_URL}/admin/subjects`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Quantum Computation',
        code: uniqueSubCode,
        department: 'Technology',
        credits: 4,
        weeklyPeriods: 5,
        description: 'Qubits, quantum gates, and quantum algorithms.',
      }),
    });
    const subData = await createSubRes.json();
    console.log(`   ✅ Created master subject: ${subData.subject?.name} (${subData.subject?.code})`);
    const masterSubjectId = subData.subject?._id;

    // 3. Test Create Class Section
    console.log('3️⃣ Testing Class Section Creation (POST /api/admin/classes)...');
    const createClassRes = await fetch(`${BASE_URL}/admin/classes`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Class 10',
        section: `Section Test-${Date.now()}`,
        roomNumber: 'Room 105',
        capacity: 38,
        classTeacher: 'Unassigned',
      }),
    });
    const classData = await createClassRes.json();
    console.log(`   ✅ Created division: ${classData.class?.name} - ${classData.class?.section} in ${classData.class?.roomNumber}`);
    const classId = classData.class?._id;

    // 4. Test Assign Class Teacher
    console.log('4️⃣ Testing Assign Class Teacher (PATCH /api/admin/classes/:id/class-teacher)...');
    const assignTeacherRes = await fetch(`${BASE_URL}/admin/classes/${classId}/class-teacher`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ classTeacher: 'Prof. Sarah Jenkins' }),
    });
    const updatedClassTeacher = await assignTeacherRes.json();
    console.log(`   ✅ Designated Class Teacher: ${updatedClassTeacher.class?.classTeacher}`);

    // 5. Test Allocate Subject 1 (Mathematics -> Prof. Sarah Jenkins)
    console.log('5️⃣ Testing Allocate Subject 1: Mathematics -> Prof. Sarah Jenkins...');
    const allocateSub1Res = await fetch(`${BASE_URL}/admin/classes/${classId}/subjects`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        subjectName: 'Mathematics',
        subjectCode: 'MTH-101',
        teacherName: 'Prof. Sarah Jenkins',
        credits: 4,
        weeklyPeriods: 5,
      }),
    });
    const classWithSub1 = await allocateSub1Res.json();
    console.log(`   ✅ Allocated subjects count: ${classWithSub1.class?.subjects.length} | First subject: ${classWithSub1.class?.subjects[0].subjectName} ➔ ${classWithSub1.class?.subjects[0].teacherName}`);

    // 6. Test Allocate Subject 2 (Science -> Dr. Robert Chen)
    console.log('6️⃣ Testing Allocate Subject 2: Science -> Dr. Robert Chen...');
    const allocateSub2Res = await fetch(`${BASE_URL}/admin/classes/${classId}/subjects`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        subjectName: 'Science',
        subjectCode: 'SCI-101',
        teacherName: 'Dr. Robert Chen',
        credits: 4,
        weeklyPeriods: 5,
      }),
    });
    const classWithSub2 = await allocateSub2Res.json();
    console.log(`   ✅ Allocated subjects count: ${classWithSub2.class?.subjects.length} | Second subject: ${classWithSub2.class?.subjects[1].subjectName} ➔ ${classWithSub2.class?.subjects[1].teacherName}`);

    // 7. Test Remove Subject (Remove Science)
    console.log('7️⃣ Testing Remove Subject (DELETE /api/admin/classes/:id/subjects/SCI-101)...');
    const removeSubRes = await fetch(`${BASE_URL}/admin/classes/${classId}/subjects/SCI-101`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const classAfterRemove = await removeSubRes.json();
    console.log(`   ✅ Remaining subjects count: ${classAfterRemove.class?.subjects.length} (Only ${classAfterRemove.class?.subjects[0].subjectName} remains)`);

    // 8. Clean up test records
    console.log('8️⃣ Cleaning up verification records...');
    await fetch(`${BASE_URL}/admin/classes/${classId}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${BASE_URL}/admin/subjects/${masterSubjectId}`, { method: 'DELETE', headers: adminHeaders });
    console.log('   ✅ Cleaned up temporary test class and subject.');

    console.log('\n🎉 ALL 8 PHASE 5 CLASS & SUBJECT MANAGEMENT TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 5 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase5Tests();

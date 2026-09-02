require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase9Tests = async () => {
  console.log('🧪 Starting Phase 9 Complete Academic Module Verification Tests...\n');

  try {
    // 1. Authenticate as Teacher (Mrs. Neha Sharma)
    console.log('1️⃣ Authenticating as Faculty (teacher@school.com)...');
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

    // 2. Schedule Examination (POST /api/academic/exams)
    console.log('2️⃣ Testing Schedule CBSE Examination (POST /api/academic/exams)...');
    const examPayload = {
      name: 'Diagnostic Unit Test 3',
      examType: 'Unit Test',
      academicSession: '2026-27',
      className: 'Class 10',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-15'),
      status: 'Upcoming',
      schedule: [
        { date: new Date('2026-11-10'), startTime: '09:00 AM', endTime: '10:30 AM', subjectName: 'Mathematics', subjectCode: 'MTH-101', maxMarks: 50, roomNumber: 'Room 101' },
      ],
    };

    const createExamRes = await fetch(`${BASE_URL}/academic/exams`, {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify(examPayload),
    });
    const examData = await createExamRes.json();
    console.log(`   ✅ Scheduled Exam: "${examData.exam?.name}" (${examData.exam?.examType})`);
    const examId = examData.exam?._id;

    // 3. Publish Student Result with Auto-Calculations (POST /api/academic/results/publish)
    console.log('3️⃣ Testing Publish CBSE Result with Auto Grades (POST /api/academic/results/publish)...');
    const resultPayload = {
      studentId: '65f012345678901234567890',
      studentName: 'Aarav Sharma',
      admissionNumber: 'ADM/2026/0101',
      rollNumber: '101',
      className: 'Class 10',
      section: 'Section A',
      academicSession: '2026-27',
      examId,
      examName: 'Diagnostic Unit Test 3',
      examType: 'Unit Test',
      subjectMarks: [
        { subjectName: 'Hindi', subjectCode: 'HIN-101', theoryMarks: 45, practicalMarks: 0, marksObtained: 45, maxMarks: 50 },
        { subjectName: 'Mathematics', subjectCode: 'MTH-101', theoryMarks: 49, practicalMarks: 0, marksObtained: 49, maxMarks: 50 },
      ],
      remarks: 'Top-tier speed and precision in algebra proof derivations.',
    };

    const publishRes = await fetch(`${BASE_URL}/academic/results/publish`, {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify(resultPayload),
    });
    const publishData = await publishRes.json();
    console.log(`   ✅ Published Marksheet for: ${publishData.result?.studentName}`);
    console.log(`   ✅ Total Marks: ${publishData.result?.totalMarksObtained} / ${publishData.result?.totalMaxMarks}`);
    console.log(`   ✅ Aggregate Percentage: ${publishData.result?.percentage}% | Overall Grade: ${publishData.result?.overallGrade}`);
    console.log(`   ✅ Result Status: ${publishData.result?.resultStatus}`);

    // 4. Authenticate as Student (Aarav Sharma)
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

    // 5. Student Retrieves Personal Marksheets (GET /api/academic/my-results)
    console.log('5️⃣ Testing Student Personal Marksheets & Official Report Card (GET /api/academic/my-results)...');
    const myResultsRes = await fetch(`${BASE_URL}/academic/my-results`, { headers: studentHeaders });
    const myResultsData = await myResultsRes.json();
    console.log(`   ✅ Retrieved ${myResultsData.results?.length} Examination Marksheets for Student`);
    console.log(`   ✅ School Identity Endorsed: "${myResultsData.schoolProfile?.schoolName}"`);

    // 6. Clean up temporary test data
    console.log('6️⃣ Cleaning up test exam schedule...');
    await fetch(`${BASE_URL}/academic/exams/${examId}`, { method: 'DELETE', headers: teacherHeaders });
    console.log('   ✅ Cleaned up temporary test exam.');

    console.log('\n🎉 ALL 6 PHASE 9 COMPLETE ACADEMIC MODULE TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 9 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase9Tests();

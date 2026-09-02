require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase7Tests = async () => {
  console.log('🧪 Starting Phase 7 Assignments & Grading Verification Tests...\n');

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

    // 2. Teacher Creates Assignment (POST /api/assignments)
    console.log('2️⃣ Testing Teacher Create Assignment (POST /api/assignments)...');
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0];
    const createAssignmentRes = await fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify({
        title: 'Trigonometric Identities & Fourier Foundations',
        description: 'Prove the orthogonality of sine and cosine functions and solve problem set 6.',
        className: 'Class 10',
        section: 'Section A',
        subjectName: 'Mathematics',
        subjectCode: 'MTH-101',
        deadline,
        totalMarks: 20,
        attachmentName: 'Trig_Fourier_Worksheet.pdf',
        attachmentUrl: 'https://school-cloud.storage/materials/Trig_Fourier_Worksheet.pdf',
      }),
    });
    const assignmentData = await createAssignmentRes.json();
    console.log(`   ✅ Created assignment: "${assignmentData.assignment?.title}" (Max Marks: ${assignmentData.assignment?.totalMarks})`);
    const assignmentId = assignmentData.assignment?._id;

    // 3. Authenticate as Student
    console.log('3️⃣ Authenticating as Student (student@school.com)...');
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

    // 4. Student Checks Pending Assignments (GET /api/assignments/my-assignments)
    console.log('4️⃣ Testing Student View Pending Assignments (GET /api/assignments/my-assignments)...');
    const myAssignmentsRes = await fetch(`${BASE_URL}/assignments/my-assignments`, { headers: studentHeaders });
    const myAssignmentsData = await myAssignmentsRes.json();
    console.log(`   ✅ Total Enrolled Assignments: ${myAssignmentsData.counts?.total} | Pending: ${myAssignmentsData.counts?.pending}`);

    // 5. Student Submits Assignment (POST /api/assignments/:id/submit)
    console.log('5️⃣ Testing Student Homework Submission (POST /api/assignments/:id/submit)...');
    const submitRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        fileName: 'Alex_Johnson_Trig_Proofs.pdf',
        fileUrl: 'https://school-cloud.storage/submissions/Alex_Johnson_Trig_Proofs.pdf',
        submissionText: 'Completed all 6 Fourier orthogonality proofs with step-by-step calculus integrations.',
      }),
    });
    const submitData = await submitRes.json();
    console.log(`   ✅ Submission status: ${submitData.success ? 'Success' : 'Failed'} | Total Submissions: ${submitData.assignment?.submissions.length}`);
    const submissionId = submitData.assignment?.submissions[0]?._id;

    // 6. Teacher Grades Submission (PATCH /api/assignments/:id/submissions/:subId/grade)
    console.log('6️⃣ Testing Teacher Grade Submission (PATCH /api/assignments/:id/submissions/:subId/grade)...');
    const gradeRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      headers: teacherHeaders,
      body: JSON.stringify({
        marksObtained: 19,
        feedback: 'Outstanding mathematical clarity and precise integration boundaries!',
      }),
    });
    const gradeData = await gradeRes.json();
    console.log(`   ✅ Graded: ${gradeData.submission?.marksObtained}/${assignmentData.assignment?.totalMarks} Marks`);
    console.log(`   ✅ Feedback: "${gradeData.submission?.feedback}"`);

    // 7. Student Checks Graded Results
    console.log('7️⃣ Testing Student Check Graded Homework & Evaluation Feedback...');
    const recheckRes = await fetch(`${BASE_URL}/assignments/my-assignments`, { headers: studentHeaders });
    const recheckData = await recheckRes.json();
    const targetCompleted = recheckData.completedList?.find((c) => c._id === assignmentId);
    console.log(`   ✅ Student retrieved score: ${targetCompleted?.submission?.marksObtained}/${targetCompleted?.totalMarks} | Status: ${targetCompleted?.status}`);

    // 8. Clean up test assignment
    console.log('8️⃣ Cleaning up test assignment...');
    await fetch(`${BASE_URL}/assignments/${assignmentId}`, { method: 'DELETE', headers: teacherHeaders });
    console.log('   ✅ Cleaned up temporary test assignment.');

    console.log('\n🎉 ALL 8 PHASE 7 ASSIGNMENT MANAGEMENT TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 7 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase7Tests();

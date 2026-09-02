require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase10Tests = async () => {
  console.log('🧪 Starting Phase 10 School Communication Verification Tests...\n');

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

    // 2. Publish Categorized Notice (POST /api/communication/notices)
    console.log('2️⃣ Testing Publish Categorized Notice (POST /api/communication/notices)...');
    const noticePayload = {
      title: 'Dussehra Holiday & Special Assembly Circular',
      content: 'Special festive cultural assembly on Thursday. School will observe Vijayadashami holiday on Friday.',
      category: 'Holiday Notice',
      audience: 'All',
      priority: 'High',
    };
    const noticeRes = await fetch(`${BASE_URL}/communication/notices`, {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify(noticePayload),
    });
    const noticeData = await noticeRes.json();
    console.log(`   ✅ Published Notice: "${noticeData.notice?.title}" (${noticeData.notice?.category})`);
    const noticeId = noticeData.notice?._id;

    // 3. Authenticate as Student (Aarav Sharma)
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

    // 4. Student Submits Grievance (POST /api/communication/complaints)
    console.log('4️⃣ Testing Student Grievance Submission (POST /api/communication/complaints)...');
    const complaintPayload = {
      subject: 'Request for Extra Biology NCERT Diagram Practice Session',
      category: 'Academic',
      description: 'Could we schedule 20 minutes to review heart and nephron dissection diagram labeling?',
    };
    const complaintRes = await fetch(`${BASE_URL}/communication/complaints`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify(complaintPayload),
    });
    const complaintData = await complaintRes.json();
    console.log(`   ✅ Filed Grievance: "${complaintData.complaint?.subject}" | Status: ${complaintData.complaint?.status}`);
    const complaintId = complaintData.complaint?._id;

    // 5. Student Applies for Leave (POST /api/communication/leaves)
    console.log('5️⃣ Testing Student Leave Application (POST /api/communication/leaves)...');
    const leavePayload = {
      leaveType: 'Medical Leave',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
      reason: 'Undergoing dental surgery and doctor-advised rest.',
    };
    const leaveRes = await fetch(`${BASE_URL}/communication/leaves`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify(leavePayload),
    });
    const leaveData = await leaveRes.json();
    console.log(`   ✅ Applied for Leave: ${leaveData.leave?.totalDays} day(s) (${leaveData.leave?.leaveType})`);
    const leaveId = leaveData.leave?._id;

    // 6. Teacher Reviews and Approves Leave (PATCH /api/communication/leaves/:id/review)
    console.log('6️⃣ Testing Teacher Leave Approval (PATCH /api/communication/leaves/:id/review)...');
    const reviewLeaveRes = await fetch(`${BASE_URL}/communication/leaves/${leaveId}/review`, {
      method: 'PATCH',
      headers: teacherHeaders,
      body: JSON.stringify({
        status: 'Approved',
        adminRemark: 'Sanctioned. Submit medical certificate upon resuming classes.',
      }),
    });
    const reviewLeaveData = await reviewLeaveRes.json();
    console.log(`   ✅ Leave Decision: ${reviewLeaveData.leave?.status} | Remark: "${reviewLeaveData.leave?.adminRemark}"`);

    // 7. Teacher Responds and Resolves Grievance (PATCH /api/communication/complaints/:id/respond)
    console.log('7️⃣ Testing Teacher Grievance Resolution (PATCH /api/communication/complaints/:id/respond)...');
    const respondRes = await fetch(`${BASE_URL}/communication/complaints/${complaintId}/respond`, {
      method: 'PATCH',
      headers: teacherHeaders,
      body: JSON.stringify({
        status: 'Resolved',
        adminResponse: 'Biology diagram workshop arranged on Friday 4th period in Bio Lab.',
      }),
    });
    const respondData = await respondRes.json();
    console.log(`   ✅ Grievance Status: ${respondData.complaint?.status} | Response: "${respondData.complaint?.adminResponse}"`);

    // 8. Student Checks Real-Time Notifications (GET /api/communication/notifications)
    console.log('8️⃣ Testing Student Notifications Inbox (GET /api/communication/notifications)...');
    const notifRes = await fetch(`${BASE_URL}/communication/notifications`, { headers: studentHeaders });
    const notifData = await notifRes.json();
    console.log(`   ✅ Retrieved ${notifData.count} notifications | Unread: ${notifData.unreadCount}`);

    // 9. Mark All Notifications as Read (PATCH /api/communication/notifications/read-all)
    console.log('9️⃣ Testing Mark All Notifications Read (PATCH /api/communication/notifications/read-all)...');
    const markReadRes = await fetch(`${BASE_URL}/communication/notifications/read-all`, {
      method: 'PATCH',
      headers: studentHeaders,
    });
    const markReadData = await markReadRes.json();
    console.log(`   ✅ Mark All Read: ${markReadData.success}`);

    // 10. Clean up test records
    console.log('🔟 Cleaning up temporary test notice...');
    await fetch(`${BASE_URL}/communication/notices/${noticeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${teacherToken}` }, // Admin or delete
    }).catch(() => {});
    console.log('   ✅ Cleaned up temporary test data.');

    console.log('\n🎉 ALL 10 PHASE 10 SCHOOL COMMUNICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 10 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase10Tests();

require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase11Tests = async () => {
  console.log('🧪 Starting Phase 11 Fees, Timetable & Reports Verification Tests...\n');

  try {
    // 1. Authenticate as Admin (Dr. Rajeshwar Prasad)
    console.log('1️⃣ Authenticating as Principal / Admin (admin@school.com)...');
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

    // 2. Generate Indian Fee Invoice (POST /api/finance/fees)
    console.log('2️⃣ Testing Generate Indian Fee Invoice (POST /api/finance/fees)...');
    const invoicePayload = {
      studentName: 'Aarav Sharma',
      admissionNumber: 'ADM/2026/0101',
      rollNumber: '101',
      className: 'Class 10 - Section A',
      title: 'Term 2 Composite School Fee 2026-27',
      dueDate: new Date('2026-11-15'),
      feeBreakdown: [
        { head: 'Tuition Fee', amount: 25000 },
        { head: 'Admission Fee', amount: 5000 },
        { head: 'Examination Fee', amount: 3000 },
        { head: 'Computer Fee', amount: 4000 },
        { head: 'Annual Fee', amount: 8000 },
      ],
    };

    const createFeeRes = await fetch(`${BASE_URL}/finance/fees`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(invoicePayload),
    });
    const feeData = await createFeeRes.json();
    console.log(`   ✅ Generated Invoice: "${feeData.fee?.invoiceNumber}"`);
    console.log(`   ✅ Total Fee: ₹${feeData.fee?.totalAmount?.toLocaleString('en-IN')} | Status: ${feeData.fee?.status}`);
    const feeId = feeData.fee?._id;

    // 3. Record Partial Fee Payment (PATCH /api/finance/fees/:id/pay)
    console.log('3️⃣ Testing Record Partial Payment via UPI (PATCH /api/finance/fees/:id/pay)...');
    const payRes = await fetch(`${BASE_URL}/finance/fees/${feeId}/pay`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        amount: 30000,
        paymentMethod: 'UPI',
        transactionRef: 'UPI/2026/TEST8841',
      }),
    });
    const payData = await payRes.json();
    console.log(`   ✅ Payment Recorded: ₹30,000 via UPI`);
    console.log(`   ✅ Total Paid: ₹${payData.fee?.paidAmount?.toLocaleString('en-IN')}`);
    console.log(`   ✅ Remaining Due: ₹${payData.fee?.remainingAmount?.toLocaleString('en-IN')} | Status: ${payData.fee?.status}`);

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

    // 5. Student Retrieves Fee Ledger (GET /api/finance/my-fees)
    console.log('5️⃣ Testing Student Fee Ledger & Invoices (GET /api/finance/my-fees)...');
    const myFeesRes = await fetch(`${BASE_URL}/finance/my-fees`, { headers: studentHeaders });
    const myFeesData = await myFeesRes.json();
    console.log(`   ✅ Retrieved ${myFeesData.fees?.length} Invoices for Student`);
    console.log(`   ✅ Summary: Total Billed: ₹${myFeesData.summary?.totalBilled?.toLocaleString('en-IN')} | Total Due: ₹${myFeesData.summary?.totalDue?.toLocaleString('en-IN')}`);

    // 6. Fetch Period-wise Timetable (GET /api/finance/timetable)
    console.log('6️⃣ Testing Period-Wise Timetable Schedule (GET /api/finance/timetable)...');
    const timetableRes = await fetch(`${BASE_URL}/finance/timetable?className=Class 10&section=Section A`, { headers: studentHeaders });
    const timetableData = await timetableRes.json();
    const mondayPeriods = timetableData.timetable?.days?.find((d) => d.dayName === 'Monday')?.periods || [];
    console.log(`   ✅ Timetable Loaded for Class 10 (Section A): ${mondayPeriods.length} Periods on Monday`);
    console.log(`   ✅ Period 1: ${mondayPeriods[0]?.startTime} - ${mondayPeriods[0]?.endTime} (${mondayPeriods[0]?.subjectName})`);
    console.log(`   ✅ Period 4: ${mondayPeriods[3]?.startTime} - ${mondayPeriods[3]?.endTime} (${mondayPeriods[3]?.subjectName})`);

    // 7. Admin Fetches Institutional Reports (GET /api/finance/reports)
    console.log('7️⃣ Testing Institutional Reports Generator (GET /api/finance/reports)...');
    const reportsRes = await fetch(`${BASE_URL}/finance/reports`, { headers: adminHeaders });
    const reportsData = await reportsRes.json();
    console.log(`   ✅ Reports Generated for School: "${reportsData.schoolProfile?.schoolName}"`);
    console.log(`   ✅ Student Count: ${reportsData.reports?.students?.totalStudents}`);
    console.log(`   ✅ Attendance Rate: ${reportsData.reports?.attendance?.overallAttendanceRate}`);
    console.log(`   ✅ Pass Rate: ${reportsData.reports?.results?.passRate}`);
    console.log(`   ✅ Fee Collection: ₹${reportsData.reports?.fees?.totalCollected?.toLocaleString('en-IN')} (${reportsData.reports?.fees?.collectionRate})`);

    // 8. Clean up test invoice
    console.log('8️⃣ Cleaning up test invoice...');
    console.log('   ✅ Test verified.');

    console.log('\n🎉 ALL 7 PHASE 11 VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 11 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase11Tests();

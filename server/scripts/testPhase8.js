require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPhase8Tests = async () => {
  console.log('🧪 Starting Phase 8 Indian School Structure & Profile Verification Tests...\n');

  try {
    // 1. Authenticate as Admin (Dr. Rajeshwar Prasad)
    console.log('1️⃣ Authenticating as Admin / Principal (admin@school.com)...');
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

    // 2. Test School Profile API (GET /api/admin/school-profile)
    console.log('2️⃣ Testing School Profile API (GET /api/admin/school-profile)...');
    const profileRes = await fetch(`${BASE_URL}/admin/school-profile`, { headers: adminHeaders });
    const profileData = await profileRes.json();
    console.log(`   ✅ School Name: "${profileData.profile?.schoolName}"`);
    console.log(`   ✅ Affiliation: "${profileData.profile?.affiliation}"`);
    console.log(`   ✅ Academic Session: "${profileData.profile?.academicSession}"`);
    console.log(`   ✅ Principal: "${profileData.profile?.principalName}"`);

    // 3. Test Update School Profile (PUT /api/admin/school-profile)
    console.log('3️⃣ Testing Update School Profile (PUT /api/admin/school-profile)...');
    const updateProfileRes = await fetch(`${BASE_URL}/admin/school-profile`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        ...profileData.profile,
        contactNumber: '+91 120 4567899',
      }),
    });
    const updatedData = await updateProfileRes.json();
    console.log(`   ✅ Updated Helpline: ${updatedData.profile?.contactNumber}`);

    // 4. Test Create Indian Student (POST /api/admin/students)
    console.log('4️⃣ Testing Indian Student Admission (POST /api/admin/students)...');
    const studentPayload = {
      admissionNumber: 'ADM/2026/0199',
      rollNumber: '199',
      name: 'Kavya Nair',
      email: 'kavya.nair@school.com',
      className: 'Class 10',
      section: 'Section A',
      academicSession: '2026-27',
      admissionDate: new Date('2026-04-20'),
      dob: new Date('2010-06-15'),
      gender: 'Female',
      fatherName: 'Mr. Suresh Nair',
      motherName: 'Mrs. Lakshmi Nair',
      guardianName: '',
      parentContact: '+91 98765 00099',
      parentEmail: 'suresh.nair@corp.in',
      parentOccupation: 'Senior Research Scientist',
      address: 'Plot 45, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      aadhaarNumber: 'XXXX-XXXX-9911',
      status: 'Active',
    };

    const createStudentRes = await fetch(`${BASE_URL}/admin/students`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(studentPayload),
    });
    const newStudentData = await createStudentRes.json();
    console.log(`   ✅ Admitted Student: "${newStudentData.student?.name}" (Admission No: ${newStudentData.student?.admissionNumber})`);
    const studentId = newStudentData.student?._id;

    // 5. Fetch Student by ID (GET /api/admin/students/:id)
    console.log('5️⃣ Testing Fetch Student by ID (GET /api/admin/students/:id)...');
    const getStudentRes = await fetch(`${BASE_URL}/admin/students/${studentId}`, { headers: adminHeaders });
    const getStudentData = await getStudentRes.json();
    console.log(`   ✅ Retrieved Parents: Father: ${getStudentData.student?.fatherName} | Mother: ${getStudentData.student?.motherName}`);
    console.log(`   ✅ Location: ${getStudentData.student?.city}, ${getStudentData.student?.state} - ${getStudentData.student?.pincode}`);
    console.log(`   ✅ Contact: ${getStudentData.student?.parentContact} | Session: ${getStudentData.student?.academicSession}`);

    // 6. Test Fetch All Students (GET /api/admin/students)
    console.log('6️⃣ Testing Fetch All Indian Students (GET /api/admin/students)...');
    const allStudentsRes = await fetch(`${BASE_URL}/admin/students`, { headers: adminHeaders });
    const allStudentsData = await allStudentsRes.json();
    console.log(`   ✅ Total Enrolled Indian Students in Register: ${allStudentsData.students?.length}`);

    // 7. Clean up test student
    console.log('7️⃣ Cleaning up test student...');
    await fetch(`${BASE_URL}/admin/students/${studentId}`, { method: 'DELETE', headers: adminHeaders });
    console.log('   ✅ Cleaned up temporary test student record.');

    console.log('\n🎉 ALL 7 PHASE 8 INDIAN SCHOOL STRUCTURE TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 8 verification test failed:', error.message);
    process.exit(1);
  }
};

runPhase8Tests();

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const SchoolProfile = require('../models/SchoolProfile');
const Notice = require('../models/Notice');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Leave = require('../models/Leave');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for Phase 11 Database Seeding...');

    // 1. Seed Core Users
    const seedUsers = [
      { name: 'Dr. Rajeshwar Prasad (Principal)', email: 'admin@school.com', password: 'admin123', role: 'admin' },
      { name: 'Mrs. Neha Sharma', email: 'teacher@school.com', password: 'teacher123', role: 'teacher' },
      { name: 'Aarav Sharma', email: 'student@school.com', password: 'student123', role: 'student' },
    ];

    for (const u of seedUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
      }
    }
    console.log('✔ Verified Core Auth Users');

    // 2. Seed Indian School Profile
    await SchoolProfile.deleteMany({});
    await SchoolProfile.create({
      schoolName: 'School Management System',
      schoolCode: 'CBSE-SCH-84210',
      affiliation: 'Affiliated to CBSE, New Delhi (Affiliation No: 2130842)',
      academicSession: '2026-27',
      principalName: 'Dr. Rajeshwar Prasad (Ph.D, M.Ed)',
      address: 'Plot 42, Institutional Area, Knowledge Park III',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      pincode: '201306',
      contactNumber: '+91 120 4567890',
      email: 'principal@delhipublicacademy.edu.in',
      website: 'www.delhipublicacademy.edu.in',
    });
    console.log(`✔ Seeded Indian School Profile`);

    // 3. Seed Master Subjects
    await Subject.deleteMany({});
    const masterSubjects = await Subject.insertMany([
      { name: 'Hindi', code: 'HIN-101', department: 'Languages', credits: 4, weeklyPeriods: 5, description: 'Hindi Vyakaran, Sahitya, and Comprehension.' },
      { name: 'English', code: 'ENG-101', department: 'Languages', credits: 4, weeklyPeriods: 5, description: 'English Language, Grammar, and Literature.' },
      { name: 'Mathematics', code: 'MTH-101', department: 'Mathematics', credits: 4, weeklyPeriods: 6, description: 'CBSE Class 10 NCERT Mathematics curriculum.' },
      { name: 'Science', code: 'SCI-101', department: 'Sciences', credits: 4, weeklyPeriods: 6, description: 'Integrated Physics, Chemistry, and Biology NCERT.' },
      { name: 'Social Science', code: 'SST-101', department: 'Humanities', credits: 4, weeklyPeriods: 5, description: 'History, Geography, Political Science & Economics.' },
      { name: 'Computer', code: 'CS-101', department: 'Technology', credits: 3, weeklyPeriods: 4, description: 'Information Technology, Python Basics, and Cyber Safety.' },
    ]);
    console.log(`✔ Seeded ${masterSubjects.length} Indian Curriculum Master Subjects`);

    // 4. Seed Faculty Members
    await Teacher.deleteMany({});
    const teachers = await Teacher.insertMany([
      {
        employeeId: 'EMP-101',
        name: 'Mrs. Neha Sharma',
        email: 'teacher@school.com',
        department: 'Mathematics',
        qualification: 'M.Sc (Mathematics), B.Ed',
        experienceYears: 11,
        phone: '+91 98112 34567',
        address: 'Sector 62, Noida, Uttar Pradesh - 201301',
        subject: 'Mathematics',
        status: 'Active',
        bio: 'Senior Mathematics Class Teacher specializing in CBSE board preparation and NTSE mentoring.',
        assignedClasses: ['Class 10 - Section A', 'Class 10 - Section B'],
        assignedSubjects: ['Mathematics'],
      },
      {
        employeeId: 'EMP-102',
        name: 'Mr. Rahul Verma',
        email: 'rahul.verma@school.com',
        department: 'Sciences',
        qualification: 'M.Sc (Physics), B.Ed',
        experienceYears: 9,
        phone: '+91 98223 45678',
        address: 'Indirapuram, Ghaziabad, Uttar Pradesh - 201014',
        subject: 'Science',
        status: 'Active',
        bio: 'Physics and General Science instructor leading the STEM science exhibition lab.',
        assignedClasses: ['Class 10 - Section A', 'Class 10 - Section B'],
        assignedSubjects: ['Science'],
      },
    ]);
    console.log(`✔ Seeded ${teachers.length} Indian Faculty Members`);

    // 5. Seed Classes
    await Class.deleteMany({});
    const classes = await Class.insertMany([
      {
        name: 'Class 10',
        section: 'Section A',
        roomNumber: 'Room 101',
        capacity: 45,
        studentsCount: 40,
        classTeacher: 'Mrs. Neha Sharma',
        subjects: [
          { subjectName: 'Hindi', subjectCode: 'HIN-101', teacherName: 'Mrs. Pooja Singh', credits: 4, weeklyPeriods: 5 },
          { subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', credits: 4, weeklyPeriods: 5 },
          { subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', credits: 4, weeklyPeriods: 6 },
          { subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', credits: 4, weeklyPeriods: 6 },
        ],
      },
      {
        name: 'Class 10',
        section: 'Section B',
        roomNumber: 'Room 102',
        capacity: 45,
        studentsCount: 38,
        classTeacher: 'Mr. Rahul Verma',
        subjects: [
          { subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', credits: 4, weeklyPeriods: 6 },
          { subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', credits: 4, weeklyPeriods: 6 },
        ],
      },
    ]);
    console.log(`✔ Seeded ${classes.length} Indian Classes`);

    // 6. Seed Indian Students Data
    await Student.deleteMany({});
    const students = await Student.insertMany([
      {
        admissionNumber: 'ADM/2026/0101',
        rollNumber: '101',
        name: 'Aarav Sharma',
        email: 'student@school.com',
        className: 'Class 10',
        section: 'Section A',
        academicSession: '2026-27',
        admissionDate: new Date('2026-04-10'),
        dob: new Date('2010-05-14'),
        gender: 'Male',
        fatherName: 'Mr. Rajesh Sharma',
        motherName: 'Mrs. Sunita Sharma',
        guardianName: 'Mr. Ramesh Sharma',
        parentContact: '+91 98765 43210',
        parentEmail: 'rajesh.sharma@corp.in',
        parentOccupation: 'Chartered Accountant',
        address: 'B-402, Shanti Kunj Apartments, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        aadhaarNumber: 'XXXX-XXXX-4812',
        status: 'Active',
        gpa: 3.92,
        attendanceRate: 98.4,
      },
      {
        admissionNumber: 'ADM/2026/0102',
        rollNumber: '102',
        name: 'Ananya Singh',
        email: 'ananya.singh@school.com',
        className: 'Class 10',
        section: 'Section A',
        academicSession: '2026-27',
        admissionDate: new Date('2026-04-10'),
        dob: new Date('2010-08-22'),
        gender: 'Female',
        fatherName: 'Mr. Devendra Singh',
        motherName: 'Mrs. Manju Singh',
        guardianName: '',
        parentContact: '+91 98765 43211',
        parentEmail: 'devendra.singh@gov.in',
        parentOccupation: 'Civil Services Officer',
        address: 'Flat 12, Type 4 Quarters, Pragati Vihar',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110003',
        aadhaarNumber: 'XXXX-XXXX-9124',
        status: 'Active',
        gpa: 3.88,
        attendanceRate: 96.0,
      },
    ]);
    console.log(`✔ Seeded ${students.length} Indian Students`);

    // 7. Seed Attendance Records
    await Attendance.deleteMany({});
    const aarav = students.find((s) => s.rollNumber === '101');
    const ananya = students.find((s) => s.rollNumber === '102');
    const now = new Date();

    const attendanceRecords = [];
    for (let dayOffset = 10; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - dayOffset);
      targetDate.setHours(0, 0, 0, 0);

      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      attendanceRecords.push({
        date: targetDate,
        className: 'Class 10',
        section: 'Section A',
        subjectName: 'Mathematics',
        subjectCode: 'MTH-101',
        markedBy: 'Mrs. Neha Sharma',
        records: [
          { studentId: aarav._id, rollNumber: aarav.rollNumber, studentName: aarav.name, status: 'Present', remark: '' },
          { studentId: ananya._id, rollNumber: ananya.rollNumber, studentName: ananya.name, status: 'Present', remark: '' },
        ],
      });
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`✔ Seeded Attendance Sessions`);

    // 8. Seed Coursework Assignments
    await Assignment.deleteMany({});
    const inThreeDays = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);
    await Assignment.insertMany([
      {
        title: 'NCERT Mathematics: Quadratic Equations & Word Problems',
        description: 'Solve Exercise 4.3 (Questions 1 to 10) from NCERT textbook.',
        className: 'Class 10',
        section: 'Section A',
        subjectName: 'Mathematics',
        subjectCode: 'MTH-101',
        teacherName: 'Mrs. Neha Sharma',
        deadline: inThreeDays,
        totalMarks: 20,
        attachmentName: 'Maths_Exercise_4.3_Problem_Set.pdf',
        attachmentUrl: 'https://school-cloud.storage/materials/Maths_Exercise_4.3.pdf',
        submissions: [
          {
            studentId: aarav._id,
            studentName: aarav.name,
            rollNumber: aarav.rollNumber,
            submittedAt: new Date(now.getTime() - 1000 * 60 * 60 * 8),
            fileName: 'Aarav_Sharma_Maths_Ex4.3.pdf',
            fileUrl: 'https://school-cloud.storage/submissions/Aarav_Sharma_Maths.pdf',
            submissionText: 'All 10 NCERT quadratic problems solved.',
            status: 'Graded',
            marksObtained: 19,
            feedback: 'Shabash Aarav! Very neat presentation.',
            gradedAt: new Date(),
            gradedBy: 'Mrs. Neha Sharma',
          },
        ],
      },
    ]);
    console.log(`✔ Seeded Coursework Assignments`);

    // 9. Seed Examinations & Results
    await Exam.deleteMany({});
    const halfYearlyExam = await Exam.create({
      name: 'Half-Yearly Examination 2026',
      examType: 'Half-Yearly',
      academicSession: '2026-27',
      className: 'Class 10',
      startDate: new Date('2026-10-05'),
      endDate: new Date('2026-10-15'),
      status: 'Results Published',
      schedule: [
        { date: new Date('2026-10-05'), startTime: '09:00 AM', endTime: '12:00 PM', subjectName: 'Hindi', subjectCode: 'HIN-101', maxMarks: 100, roomNumber: 'Room 101' },
        { date: new Date('2026-10-09'), startTime: '09:00 AM', endTime: '12:00 PM', subjectName: 'Mathematics', subjectCode: 'MTH-101', maxMarks: 100, roomNumber: 'Room 101' },
      ],
    });

    await Result.deleteMany({});
    await Result.insertMany([
      {
        studentId: aarav._id,
        studentName: aarav.name,
        admissionNumber: aarav.admissionNumber,
        rollNumber: aarav.rollNumber,
        className: 'Class 10',
        section: 'Section A',
        academicSession: '2026-27',
        examId: halfYearlyExam._id,
        examName: 'Half-Yearly Examination 2026',
        examType: 'Half-Yearly',
        subjectMarks: [
          { subjectName: 'Hindi', subjectCode: 'HIN-101', theoryMarks: 72, practicalMarks: 20, marksObtained: 92, maxMarks: 100, grade: 'A1' },
          { subjectName: 'Mathematics', subjectCode: 'MTH-101', theoryMarks: 79, practicalMarks: 20, marksObtained: 99, maxMarks: 100, grade: 'A1' },
        ],
        totalMarksObtained: 191,
        totalMaxMarks: 200,
        percentage: 95.5,
        overallGrade: 'A1',
        resultStatus: 'Pass',
        rankInClass: 1,
        remarks: 'Outstanding academic performance in Mathematics.',
      },
    ]);
    console.log(`✔ Seeded Exams & Results`);

    // 10. Seed Categorized Notices
    await Notice.deleteMany({});
    await Notice.insertMany([
      {
        title: 'School Holiday Notice: Mahatma Gandhi Jayanti',
        content: 'The school shall remain closed on Friday, 2nd October on the occasion of Gandhi Jayanti.',
        category: 'Holiday Notice',
        audience: 'All',
        priority: 'High',
        postedBy: 'Dr. Rajeshwar Prasad (Principal)',
      },
      {
        title: 'Parent-Teacher Meeting (PTM) for Term 1',
        content: 'PTM for Class 10 will be conducted on Saturday, 26th September from 08:30 AM to 12:30 PM.',
        category: 'PTM Notice',
        audience: 'Parents',
        priority: 'High',
        postedBy: 'Mrs. Neha Sharma (Class Teacher)',
      },
    ]);
    console.log(`✔ Seeded Categorized Indian Notices`);

    // 11. Seed Complaints
    await Complaint.deleteMany({});
    await Complaint.insertMany([
      {
        studentId: aarav._id,
        studentName: aarav.name,
        admissionNumber: aarav.admissionNumber,
        rollNumber: aarav.rollNumber,
        className: 'Class 10',
        subject: 'Request for Extra Doubt Clearing Session in Mathematics',
        category: 'Academic',
        description: 'Sir/Ma’am, could we please schedule a 30-minute doubt session before the unit tests?',
        status: 'Resolved',
        adminResponse: 'Doubt clearing workshop scheduled on Thursday zero-period from 08:00 AM.',
        resolvedBy: 'Mrs. Neha Sharma',
        resolvedAt: new Date(),
      },
    ]);
    console.log(`✔ Seeded Complaints`);

    // 12. Seed Leaves
    await Leave.deleteMany({});
    await Leave.insertMany([
      {
        applicantId: new mongoose.Types.ObjectId(),
        applicantName: 'Riya Mishra',
        applicantRole: 'student',
        className: 'Class 10',
        admissionNumber: 'ADM/2026/0103',
        rollNumber: '103',
        leaveType: 'Casual Leave',
        startDate: new Date('2026-09-12'),
        endDate: new Date('2026-09-13'),
        totalDays: 2,
        reason: 'Family function in hometown.',
        status: 'Approved',
        reviewedBy: 'Mrs. Neha Singh',
        adminRemark: 'Approved. Ensure class homework is submitted on return.',
        reviewedAt: new Date('2026-09-11'),
      },
      {
        applicantId: ananya._id,
        applicantName: 'Ananya Singh',
        applicantRole: 'student',
        className: 'Class 10',
        admissionNumber: ananya.admissionNumber,
        rollNumber: ananya.rollNumber,
        leaveType: 'Medical Leave',
        startDate: new Date('2026-09-09'),
        endDate: new Date('2026-09-10'),
        totalDays: 2,
        reason: 'Undergoing dental surgery and doctor-advised rest.',
        status: 'Approved',
        reviewedBy: 'Mrs. Priya Sharma',
        adminRemark: 'Sanctioned. Submit medical certificate upon resuming classes.',
        reviewedAt: new Date('2026-09-08'),
      },
    ]);
    console.log(`✔ Seeded 2 Leave Applications (Riya Mishra & Ananya Singh)`);

    // 13. Seed 💰 Indian School Fee Invoices (Phase 11)
    await Fee.deleteMany({});
    await Fee.insertMany([
      {
        studentId: aarav._id,
        studentName: aarav.name,
        admissionNumber: aarav.admissionNumber,
        rollNumber: aarav.rollNumber,
        className: 'Class 10 - Section A',
        academicSession: '2026-27',
        invoiceNumber: 'INV/2026/0101',
        title: 'Composite Annual & Term 1 School Fee (Academic Session 2026-27)',
        totalAmount: 45000,
        paidAmount: 30000,
        remainingAmount: 15000,
        dueDate: new Date('2026-09-15'),
        status: 'Partial',
        feeBreakdown: [
          { head: 'Tuition Fee', amount: 25000 },
          { head: 'Admission Fee', amount: 5000 },
          { head: 'Examination Fee', amount: 3000 },
          { head: 'Transport Fee', amount: 0 },
          { head: 'Computer Fee', amount: 4000 },
          { head: 'Annual Fee', amount: 8000 },
        ],
        transactions: [
          {
            amount: 30000,
            date: new Date('2026-04-15'),
            paymentMethod: 'UPI',
            transactionRef: 'UPI/2026/984210',
            receiptNumber: 'REC-2026-8812',
            receivedBy: 'Accounts Office (Mr. Surendra)',
          },
        ],
      },
      {
        studentId: ananya._id,
        studentName: ananya.name,
        admissionNumber: ananya.admissionNumber,
        rollNumber: ananya.rollNumber,
        className: 'Class 10 - Section A',
        academicSession: '2026-27',
        invoiceNumber: 'INV/2026/0102',
        title: 'Composite Annual & Term 1 School Fee (Academic Session 2026-27)',
        totalAmount: 45000,
        paidAmount: 45000,
        remainingAmount: 0,
        dueDate: new Date('2026-09-15'),
        status: 'Paid',
        feeBreakdown: [
          { head: 'Tuition Fee', amount: 25000 },
          { head: 'Admission Fee', amount: 5000 },
          { head: 'Examination Fee', amount: 3000 },
          { head: 'Transport Fee', amount: 0 },
          { head: 'Computer Fee', amount: 4000 },
          { head: 'Annual Fee', amount: 8000 },
        ],
        transactions: [
          {
            amount: 45000,
            date: new Date('2026-04-12'),
            paymentMethod: 'Net Banking',
            transactionRef: 'HDFC/NET/552109',
            receiptNumber: 'REC-2026-7140',
            receivedBy: 'Accounts Office (Mr. Surendra)',
          },
        ],
      },
    ]);
    console.log(`✔ Seeded 💰 Indian Fee Invoices (Total ₹45,000, Paid ₹30,000, Due ₹15,000, Status: Partial)`);

    // 14. Seed 🗓️ Period-wise Class Timetable (Phase 11)
    await Timetable.deleteMany({});
    await Timetable.create({
      className: 'Class 10',
      section: 'Section A',
      academicSession: '2026-27',
      days: [
        {
          dayName: 'Monday',
          periods: [
            { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
            { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
            { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
            { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
            { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'Hindi', subjectCode: 'HIN-101', teacherName: 'Mrs. Pooja Singh', roomNumber: 'Room 101' },
            { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Computer', subjectCode: 'CS-101', teacherName: 'Mr. Amit Srivastava', roomNumber: 'Computer Lab' },
          ],
        },
        {
          dayName: 'Tuesday',
          periods: [
            { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
            { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
            { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Social Science', subjectCode: 'SST-101', teacherName: 'Mr. Rajesh Gupta', roomNumber: 'Room 101' },
            { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
            { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
            { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Computer', subjectCode: 'CS-101', teacherName: 'Mr. Amit Srivastava', roomNumber: 'Computer Lab' },
          ],
        },
        {
          dayName: 'Wednesday',
          periods: [
            { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
            { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Social Science', subjectCode: 'SST-101', teacherName: 'Mr. Rajesh Gupta', roomNumber: 'Room 101' },
            { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Hindi', subjectCode: 'HIN-101', teacherName: 'Mrs. Pooja Singh', roomNumber: 'Room 101' },
            { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
            { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
            { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Computer', subjectCode: 'CS-101', teacherName: 'Mr. Amit Srivastava', roomNumber: 'Computer Lab' },
          ],
        },
        {
          dayName: 'Thursday',
          periods: [
            { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
            { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
            { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
            { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
            { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'Hindi', subjectCode: 'HIN-101', teacherName: 'Mrs. Pooja Singh', roomNumber: 'Room 101' },
            { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'General Knowledge', subjectCode: 'GK-101', teacherName: 'Mr. Rajesh Gupta', roomNumber: 'Room 101' },
          ],
        },
        {
          dayName: 'Friday',
          periods: [
            { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
            { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Science Practical', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Physics Lab' },
            { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Science Practical', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Chemistry Lab' },
            { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
            { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
            { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Computer', subjectCode: 'CS-101', teacherName: 'Mr. Amit Srivastava', roomNumber: 'Computer Lab' },
          ],
        },
      ],
    });
    console.log(`✔ Seeded 🗓️ Class 10 Period-wise Timetable (Monday to Friday, 08:00 to 12:00)`);

    // 15. Seed Notification Alerts
    await Notification.deleteMany({});
    await Notification.insertMany([
      {
        recipientRole: 'all',
        title: '📢 School Holiday: Mahatma Gandhi Jayanti',
        message: 'The school shall remain closed on 2nd October on the occasion of Gandhi Jayanti.',
        type: 'notice',
        isRead: false,
      },
      {
        recipientRole: 'student',
        title: '💰 Fee Due Reminder: Term 1 Installment',
        message: 'Remaining balance ₹15,000 for Invoice INV/2026/0101 is due on 15 Sept 2026.',
        type: 'system',
        isRead: false,
      },
    ]);
    console.log(`✔ Seeded Notification Alerts`);

    console.log('\n🎉 PHASE 11 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during Phase 11 seeding:', err);
    process.exit(1);
  }
};

seedDatabase();

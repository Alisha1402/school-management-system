const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Student = require('../models/Student');
const SchoolProfile = require('../models/SchoolProfile');
const Activity = require('../models/Activity');

// CBSE Grade Computation Helper
const computeCBSEGrade = (pct) => {
  if (pct >= 91) return 'A1';
  if (pct >= 81) return 'A2';
  if (pct >= 71) return 'B1';
  if (pct >= 61) return 'B2';
  if (pct >= 51) return 'C1';
  if (pct >= 41) return 'C2';
  if (pct >= 33) return 'D';
  return 'E';
};

// ==========================================
// EXAMS CONTROLLER
// ==========================================
const getExams = async (req, res) => {
  try {
    const { className, examType, academicSession } = req.query;
    const filter = {};
    if (className && className !== 'All') filter.className = className;
    if (examType && examType !== 'All') filter.examType = examType;
    if (academicSession) filter.academicSession = academicSession;

    const exams = await Exam.find(filter).sort({ startDate: -1 });
    res.status(200).json({ success: true, count: exams.length, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    await Activity.create({
      title: 'Examination Scheduled',
      type: 'exam',
      description: `${exam.name} timetable published for ${exam.className}.`,
      actor: req.user.name,
    });
    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// RESULTS & REPORT CARDS CONTROLLER
// ==========================================
const getResults = async (req, res) => {
  try {
    const { className, section, examName, academicSession } = req.query;
    const filter = {};
    if (className && className !== 'All') filter.className = className;
    if (section && section !== 'All') filter.section = section;
    if (examName && examName !== 'All') filter.examName = examName;
    if (academicSession) filter.academicSession = academicSession;

    const results = await Result.find(filter).sort({ percentage: -1 });
    res.status(200).json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Publish or Update a Student Result with Auto-Calculations
const publishResult = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      admissionNumber,
      rollNumber,
      className,
      section,
      academicSession,
      examId,
      examName,
      examType,
      subjectMarks,
      remarks,
    } = req.body;

    // Process each subject's marks and assign CBSE grades
    let totalObtained = 0;
    let totalMax = 0;

    const calculatedSubjects = (subjectMarks || []).map((s) => {
      const theory = Number(s.theoryMarks || 0);
      const practical = Number(s.practicalMarks || 0);
      const totalSubjObtained = s.marksObtained !== undefined ? Number(s.marksObtained) : theory + practical;
      const maxM = Number(s.maxMarks || 100);

      const subjPct = maxM > 0 ? (totalSubjObtained / maxM) * 100 : 0;
      const grade = computeCBSEGrade(subjPct);

      totalObtained += totalSubjObtained;
      totalMax += maxM;

      return {
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        theoryMarks: theory,
        practicalMarks: practical,
        marksObtained: totalSubjObtained,
        maxMarks: maxM,
        grade,
      };
    });

    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
    const overallGrade = computeCBSEGrade(percentage);
    const resultStatus = percentage >= 33 ? 'Pass' : 'Fail';

    const result = await Result.findOneAndUpdate(
      { studentId, examName },
      {
        studentId,
        studentName,
        admissionNumber,
        rollNumber,
        className,
        section,
        academicSession: academicSession || '2026-27',
        examId,
        examName,
        examType: examType || 'Half-Yearly',
        subjectMarks: calculatedSubjects,
        totalMarksObtained: totalObtained,
        totalMaxMarks: totalMax,
        percentage,
        overallGrade,
        resultStatus,
        remarks: remarks || 'Good performance. Keep up the dedication.',
      },
      { upsert: true, new: true, runValidators: true }
    );

    await Activity.create({
      title: 'Academic Results Published',
      type: 'exam',
      description: `Marksheet released for ${studentName} (${className} - ${section}) for ${examName}: ${percentage}% (${overallGrade}).`,
      actor: req.user.name,
    });

    res.status(200).json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Student Retrieves Personal Results
const getMyResults = async (req, res) => {
  try {
    let student = await Student.findOne({ email: req.user.email });
    if (!student) {
      student = await Student.findOne();
    }

    const results = await Result.find({
      $or: [{ studentId: student?._id }, { admissionNumber: student?.admissionNumber }, { rollNumber: student?.rollNumber }],
    }).sort({ createdAt: -1 });

    const schoolProfile = (await SchoolProfile.findOne()) || {
      schoolName: 'School Management System',
      schoolCode: 'CBSE-SCH-84210',
      affiliation: 'Affiliated to CBSE, New Delhi (Affiliation No: 2130842)',
      academicSession: '2026-27',
      principalName: 'Dr. Rajeshwar Prasad (Ph.D, M.Ed)',
    };

    res.status(200).json({
      success: true,
      student,
      schoolProfile,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch Full Report Card by ID
const getStudentReportCard = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Result record not found' });

    const student = await Student.findById(result.studentId);
    const schoolProfile = (await SchoolProfile.findOne()) || {
      schoolName: 'School Management System',
      schoolCode: 'CBSE-SCH-84210',
      affiliation: 'Affiliated to CBSE, New Delhi (Affiliation No: 2130842)',
      academicSession: '2026-27',
      principalName: 'Dr. Rajeshwar Prasad (Ph.D, M.Ed)',
      address: 'Plot 42, Knowledge Park III, Greater Noida, Uttar Pradesh - 201306',
    };

    res.status(200).json({
      success: true,
      result,
      student,
      schoolProfile,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getResults,
  publishResult,
  getMyResults,
  getStudentReportCard,
};

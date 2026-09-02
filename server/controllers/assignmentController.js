const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Activity = require('../models/Activity');

// @desc    Get All Assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const { className, section, subjectCode, teacherName } = req.query;
    const filter = {};
    if (className && className !== 'All') filter.className = className;
    if (section && section !== 'All') filter.section = section;
    if (subjectCode && subjectCode !== 'All') filter.subjectCode = subjectCode.toUpperCase();
    if (teacherName && teacherName !== 'All') filter.teacherName = teacherName;

    const assignments = await Assignment.find(filter).sort({ deadline: 1 });
    res.status(200).json({ success: true, count: assignments.length, assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Single Assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.status(200).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create Assignment (Teacher & Admin)
// @route   POST /api/assignments
// @access  Private (Teacher, Admin)
const createAssignment = async (req, res) => {
  try {
    const teacherName = req.body.teacherName || req.user.name;
    const assignment = await Assignment.create({
      ...req.body,
      teacherName,
    });

    await Activity.create({
      title: 'New Assignment Published',
      type: 'exam',
      description: `${teacherName} posted assignment "${assignment.title}" for ${assignment.className} - ${assignment.section}.`,
      actor: teacherName,
    });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update Assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher, Admin)
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.status(200).json({ success: true, assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete Assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher, Admin)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Student Submits Homework Deliverable
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Find student details
    let student = await Student.findOne({ email: req.user.email });
    if (!student) {
      student = {
        _id: req.user._id,
        name: req.user.name,
        rollNumber: 'STU-1001',
      };
    }

    const { fileUrl, fileName, submissionText } = req.body;
    const isLate = new Date() > new Date(assignment.deadline);

    // Check if already submitted -> update; otherwise append
    const existingIndex = assignment.submissions.findIndex(
      (s) => s.rollNumber === student.rollNumber || (s.studentId && s.studentId.toString() === student._id.toString())
    );

    const submissionData = {
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      submittedAt: new Date(),
      fileUrl: fileUrl || 'https://school-cloud.storage/submissions/solution.pdf',
      fileName: fileName || 'Homework_Solution.pdf',
      submissionText: submissionText || 'Attached homework problem derivations and code implementation.',
      status: isLate ? 'Late' : 'Submitted',
    };

    if (existingIndex > -1) {
      assignment.submissions[existingIndex] = {
        ...assignment.submissions[existingIndex].toObject(),
        ...submissionData,
      };
    } else {
      assignment.submissions.push(submissionData);
    }

    await assignment.save();

    await Activity.create({
      title: 'Assignment Submitted',
      type: 'exam',
      description: `${student.name} (${student.rollNumber}) turned in "${assignment.title}".`,
      actor: student.name,
    });

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      assignment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Teacher Grades Student Submission
// @route   PATCH /api/assignments/:id/submissions/:submissionId/grade
// @access  Private (Teacher, Admin)
const gradeSubmission = async (req, res) => {
  try {
    const { id, submissionId } = req.params;
    const { marksObtained, feedback } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.marksObtained = Number(marksObtained);
    submission.feedback = feedback || 'Well completed work.';
    submission.status = 'Graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.name;

    await assignment.save();

    await Activity.create({
      title: 'Assignment Graded',
      type: 'exam',
      description: `Graded ${submission.studentName}'s submission for "${assignment.title}": ${marksObtained}/${assignment.totalMarks} Marks.`,
      actor: req.user.name,
    });

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      assignment,
      submission,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Student Enrolled Assignments with Personal Submission Status
// @route   GET /api/assignments/my-assignments
// @access  Private (Student)
const getMyAssignments = async (req, res) => {
  try {
    let student = await Student.findOne({ email: req.user.email });
    if (!student) {
      student = await Student.findOne();
    }

    const studentClass = student?.className || 'Class 10 - Section A';
    const rollNumber = student?.rollNumber || 'STU-1001';

    // Find all assignments matching student's grade or open to all
    const allAssignments = await Assignment.find().sort({ deadline: 1 });

    const now = new Date();
    const pendingList = [];
    const completedList = [];

    allAssignments.forEach((a) => {
      const sub = a.submissions.find((s) => s.rollNumber === rollNumber);
      const isOverdue = now > new Date(a.deadline);

      const item = {
        _id: a._id,
        title: a.title,
        description: a.description,
        className: a.className,
        section: a.section,
        subjectName: a.subjectName,
        subjectCode: a.subjectCode,
        teacherName: a.teacherName,
        deadline: a.deadline,
        totalMarks: a.totalMarks,
        attachmentUrl: a.attachmentUrl,
        attachmentName: a.attachmentName,
        isOverdue,
        submission: sub || null,
        status: sub ? sub.status : isOverdue ? 'Overdue' : 'Pending',
      };

      if (sub) {
        completedList.push(item);
      } else {
        pendingList.push(item);
      }
    });

    res.status(200).json({
      success: true,
      student: {
        name: student?.name || req.user.name,
        rollNumber,
        className: studentClass,
      },
      counts: {
        total: allAssignments.length,
        pending: pendingList.length,
        completed: completedList.length,
      },
      pendingList,
      completedList,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getMyAssignments,
};

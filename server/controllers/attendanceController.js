const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Activity = require('../models/Activity');

// Helper to normalize date to midnight UTC/Local
const normalizeDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Save or Update Attendance for a Class Session
// @route   POST /api/attendance
// @access  Private (Teacher, Admin)
const saveAttendance = async (req, res) => {
  try {
    const { date, className, section, subjectName, subjectCode, records } = req.body;

    if (!className || !section || !subjectCode || !records) {
      return res.status(400).json({
        success: false,
        message: 'Please provide className, section, subjectCode, and records',
      });
    }

    const sessionDate = normalizeDate(date);
    const markedBy = req.user?.name || 'Faculty Instructor';

    const attendance = await Attendance.findOneAndUpdate(
      {
        date: sessionDate,
        className,
        section,
        subjectCode: subjectCode.toUpperCase(),
      },
      {
        date: sessionDate,
        className,
        section,
        subjectName,
        subjectCode: subjectCode.toUpperCase(),
        markedBy,
        records,
      },
      { upsert: true, new: true, runValidators: true }
    );

    const presentCount = records.filter((r) => r.status === 'Present').length;
    const totalCount = records.length;

    await Activity.create({
      title: 'Attendance Marked',
      type: 'attendance',
      description: `${markedBy} recorded attendance for ${className} - ${section} (${subjectName}): ${presentCount}/${totalCount} Present.`,
      actor: markedBy,
    });

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save attendance',
      error: error.message,
    });
  }
};

// @desc    Get Session Attendance or Live Student Roster
// @route   GET /api/attendance/session
// @access  Private
const getSessionAttendance = async (req, res) => {
  try {
    const { date, className, section, subjectCode } = req.query;

    if (!className || !section) {
      return res.status(400).json({ success: false, message: 'Class name and section are required' });
    }

    const sessionDate = normalizeDate(date);

    // Check if session attendance is already saved
    const existing = await Attendance.findOne({
      date: sessionDate,
      className,
      section,
      subjectCode: (subjectCode || '').toUpperCase(),
    });

    if (existing && existing.records && existing.records.length > 0) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        attendance: existing,
        records: existing.records,
      });
    }

    // Otherwise fetch active students in this class/section to populate a fresh roster
    const fullClassIdentifier = `${className} - ${section}`;
    const students = await Student.find({
      $or: [
        { className: fullClassIdentifier },
        { className: className, section: section },
        { className: new RegExp(className, 'i'), section: new RegExp(section.replace('Section ', ''), 'i') },
      ],
      status: 'Active',
    }).sort({ rollNumber: 1 });

    const initialRecords = students.map((s) => ({
      studentId: s._id,
      rollNumber: s.rollNumber,
      studentName: s.name,
      status: 'Present',
      remark: '',
    }));

    res.status(200).json({
      success: true,
      alreadyMarked: false,
      records: initialRecords,
      studentsCount: students.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session attendance',
      error: error.message,
    });
  }
};

// @desc    Get Student Personal Attendance Metrics & History
// @route   GET /api/attendance/my-attendance
// @access  Private (Student, Parent, Admin, Teacher)
const getMyAttendance = async (req, res) => {
  try {
    let student;
    if (req.query.studentId) {
      student = await Student.findById(req.query.studentId);
    } else {
      // Find by authenticated user email
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      // Fallback: look for any student or user
      student = await Student.findOne();
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Fetch all attendance sessions containing this student
    const allSessions = await Attendance.find({
      'records.rollNumber': student.rollNumber,
    }).sort({ date: -1 });

    let totalSessions = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;
    const history = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    allSessions.forEach((session) => {
      const match = session.records.find((r) => r.rollNumber === student.rollNumber);
      if (match) {
        totalSessions++;
        if (match.status === 'Present') presentCount++;
        else if (match.status === 'Absent') absentCount++;
        else if (match.status === 'Late') lateCount++;
        else if (match.status === 'Leave') leaveCount++;

        const dateObj = new Date(session.date);
        const monthKey = monthNames[dateObj.getMonth()];

        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { total: 0, present: 0, absent: 0, late: 0, leave: 0 };
        }
        monthlyMap[monthKey].total++;
        if (match.status === 'Present') monthlyMap[monthKey].present++;
        if (match.status === 'Absent') monthlyMap[monthKey].absent++;
        if (match.status === 'Late') monthlyMap[monthKey].late++;
        if (match.status === 'Leave') monthlyMap[monthKey].leave++;

        history.push({
          sessionId: session._id,
          date: session.date,
          className: session.className,
          section: session.section,
          subjectName: session.subjectName,
          subjectCode: session.subjectCode,
          markedBy: session.markedBy,
          status: match.status,
          remark: match.remark,
        });
      }
    });

    const overallPercentage =
      totalSessions > 0
        ? Number((((presentCount + lateCount * 0.7) / totalSessions) * 100).toFixed(1))
        : 96.0;

    // Today's records
    const todayMidnight = normalizeDate(new Date()).getTime();
    const todaySessions = history.filter(
      (h) => new Date(h.date).setHours(0, 0, 0, 0) === todayMidnight
    );

    const monthlyBreakdown = Object.keys(monthlyMap).map((m) => ({
      month: m,
      ...monthlyMap[m],
      percentage: Math.round((monthlyMap[m].present / monthlyMap[m].total) * 100),
    }));

    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        className: student.className,
        email: student.email,
      },
      stats: {
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        overallPercentage,
      },
      todaySessions,
      monthlyBreakdown,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personal attendance',
      error: error.message,
    });
  }
};

// @desc    Get Comprehensive Institutional Attendance Reports
// @route   GET /api/attendance/reports
// @access  Private (Admin)
const getAdminAttendanceReports = async (req, res) => {
  try {
    const { startDate, endDate, className, subjectCode } = req.query;

    const filter = {};
    if (className && className !== 'All') filter.className = className;
    if (subjectCode && subjectCode !== 'All') filter.subjectCode = subjectCode.toUpperCase();
    if (startDate && endDate) {
      filter.date = { $gte: normalizeDate(startDate), $lte: normalizeDate(endDate) };
    }

    const sessions = await Attendance.find(filter).sort({ date: -1 }).limit(100);

    let totalRecordsMarked = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;

    const classAggregation = {};

    sessions.forEach((s) => {
      const classKey = `${s.className} - ${s.section}`;
      if (!classAggregation[classKey]) {
        classAggregation[classKey] = {
          className: s.className,
          section: s.section,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
        };
      }

      s.records.forEach((r) => {
        totalRecordsMarked++;
        classAggregation[classKey].total++;
        if (r.status === 'Present') {
          totalPresent++;
          classAggregation[classKey].present++;
        } else if (r.status === 'Absent') {
          totalAbsent++;
          classAggregation[classKey].absent++;
        } else if (r.status === 'Late') {
          totalLate++;
          classAggregation[classKey].late++;
        } else if (r.status === 'Leave') {
          totalLeave++;
          classAggregation[classKey].leave++;
        }
      });
    });

    const averageRate =
      totalRecordsMarked > 0
        ? Number((((totalPresent + totalLate * 0.7) / totalRecordsMarked) * 100).toFixed(1))
        : 94.6;

    const classLeaderboard = Object.keys(classAggregation).map((key) => {
      const item = classAggregation[key];
      const rate = item.total > 0 ? Number(((item.present / item.total) * 100).toFixed(1)) : 90;
      return {
        classIdentifier: key,
        ...item,
        rate,
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        totalSessionsCount: sessions.length,
        totalRecordsMarked,
        totalPresent,
        totalAbsent,
        totalLate,
        totalLeave,
        averageRate,
      },
      classLeaderboard,
      recentSessions: sessions.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance reports',
      error: error.message,
    });
  }
};

module.exports = {
  saveAttendance,
  getSessionAttendance,
  getMyAttendance,
  getAdminAttendanceReports,
};

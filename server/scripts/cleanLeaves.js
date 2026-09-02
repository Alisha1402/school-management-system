require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Leave = require('../models/Leave');

async function cleanLeaves() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';
  await mongoose.connect(mongoURI);

  // Permanently delete any Alex Johnson or Sarah Jenkins record
  const result = await Leave.deleteMany({
    $or: [
      { applicantName: { $regex: 'Alex', $options: 'i' } },
      { applicantName: { $regex: 'Johnson', $options: 'i' } },
      { reviewedBy: { $regex: 'Sarah', $options: 'i' } },
      { reviewedBy: { $regex: 'Jenkins', $options: 'i' } },
    ],
  });

  console.log(`Deleted ${result.deletedCount} unwanted legacy records.`);

  const remaining = await Leave.find().sort({ createdAt: 1 });
  console.log(`\n📋 Current Leave Requests in Database (${remaining.length} total):`);
  remaining.forEach((l, idx) => {
    console.log(`\nRecord ${idx + 1}:`);
    console.log(`- Student Name: ${l.applicantName}`);
    console.log(`- Role: ${l.applicantRole}`);
    console.log(`- Class: ${l.className}`);
    console.log(`- Leave Type: ${l.leaveType}`);
    console.log(`- Dates: ${new Date(l.startDate).toLocaleDateString()} to ${new Date(l.endDate).toLocaleDateString()}`);
    console.log(`- Total Days: ${l.totalDays} Days`);
    console.log(`- Reason: ${l.reason}`);
    console.log(`- Status: ${l.status}`);
    console.log(`- Approved By: ${l.reviewedBy}`);
    console.log(`- Remarks: "${l.adminRemark}"`);
  });

  process.exit(0);
}

cleanLeaves().catch((err) => {
  console.error(err);
  process.exit(1);
});

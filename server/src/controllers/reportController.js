const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const { getTodayDateKey } = require('../utils/attendanceHelpers');
const { getTeamMemberIds } = require('./attendanceController');

const getDailyReport = asyncHandler(async (req, res) => {
  const date = req.query.date || getTodayDateKey();
  let filter = { date };

  if (req.user.role === 'employee') {
    filter.userId = req.user._id;
  } else if (req.user.role === 'manager') {
    const teamIds = await getTeamMemberIds(req.user._id);
    filter.userId = { $in: teamIds };
  }

  const attendance = await Attendance.find(filter)
    .populate('userId', 'name email role')
    .populate('validatedBy', 'name email')
    .sort({ 'punchIn.time': 1 });

  const report = attendance.map((item) => ({
    id: item._id,
    name: item.userId?.name,
    email: item.userId?.email,
    punchInTime: item.punchIn?.time,
    punchOutTime: item.punchOut?.time || null,
    punchInSelfie: item.punchIn?.selfie,
    punchOutSelfie: item.punchOut?.selfie || null,
    punchInLocation: {
      latitude: item.punchIn?.latitude,
      longitude: item.punchIn?.longitude,
    },
    punchOutLocation: item.punchOut
      ? {
          latitude: item.punchOut.latitude,
          longitude: item.punchOut.longitude,
        }
      : null,
    workingHours: item.workingHours,
    shiftStatus: item.shiftStatus,
    validationStatus: item.validationStatus,
    overtimeStatus: item.overtimeStatus,
    validationRemarks: item.validationRemarks,
  }));

  res.json({
    success: true,
    data: {
      date,
      count: report.length,
      report,
    },
  });
});

module.exports = { getDailyReport };

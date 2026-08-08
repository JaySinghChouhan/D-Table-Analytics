const { validationResult } = require('express-validator');
const OvertimeRequest = require('../models/OvertimeRequest');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const { getTeamMemberIds } = require('./attendanceController');

const requestOvertime = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }

  const { attendanceId, requestedHours, reason } = req.body;
  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    res.status(404);
    throw new Error('Attendance not found');
  }
  if (String(attendance.userId) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only request OT for your own attendance');
  }
  if (!attendance.punchOut) {
    res.status(400);
    throw new Error('Punch out before requesting overtime');
  }
  if (['pending', 'approved'].includes(attendance.overtimeStatus)) {
    res.status(400);
    throw new Error('An overtime request already exists for this attendance');
  }

  const ot = await OvertimeRequest.create({
    userId: req.user._id,
    attendanceId: attendance._id,
    requestedHours,
    reason,
  });

  attendance.overtimeStatus = 'pending';
  attendance.overtimeRequestId = ot._id;
  await attendance.save();

  const populated = await OvertimeRequest.findById(ot._id)
    .populate('userId', 'name email role')
    .populate('attendanceId');

  res.status(201).json({
    success: true,
    message: 'Overtime request submitted',
    data: { overtime: populated },
  });
});

const getMyOvertime = asyncHandler(async (req, res) => {
  const items = await OvertimeRequest.find({ userId: req.user._id })
    .populate('attendanceId')
    .populate('reviewedBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { overtime: items },
  });
});

const getPendingOvertime = asyncHandler(async (req, res) => {
  let filter = { status: 'pending' };

  if (req.user.role === 'manager') {
    const teamIds = await getTeamMemberIds(req.user._id);
    filter.userId = { $in: teamIds };
  }

  const items = await OvertimeRequest.find(filter)
    .populate('userId', 'name email role managerId')
    .populate('attendanceId')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { overtime: items },
  });
});

const reviewOvertime = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }

  const { status, reviewRemarks } = req.body;
  const ot = await OvertimeRequest.findById(req.params.id).populate('userId', 'managerId');

  if (!ot) {
    res.status(404);
    throw new Error('Overtime request not found');
  }
  if (ot.status !== 'pending') {
    res.status(400);
    throw new Error('This overtime request has already been reviewed');
  }

  if (req.user.role === 'manager') {
    const teamIds = await getTeamMemberIds(req.user._id);
    const isTeam = teamIds.some((id) => String(id) === String(ot.userId._id));
    if (!isTeam) {
      res.status(403);
      throw new Error('You can only review your team overtime requests');
    }
  }

  ot.status = status;
  ot.reviewRemarks = reviewRemarks || '';
  ot.reviewedBy = req.user._id;
  await ot.save();

  await Attendance.findByIdAndUpdate(ot.attendanceId, {
    overtimeStatus: status,
  });

  const populated = await OvertimeRequest.findById(ot._id)
    .populate('userId', 'name email role')
    .populate('attendanceId')
    .populate('reviewedBy', 'name email role');

  res.json({
    success: true,
    message: `Overtime request ${status}`,
    data: { overtime: populated },
  });
});

module.exports = {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  reviewOvertime,
};

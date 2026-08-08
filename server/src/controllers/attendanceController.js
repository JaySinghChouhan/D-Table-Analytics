const { validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const {
  getTodayDateKey,
  calculateWorkingHours,
  getShiftStatus,
} = require('../utils/attendanceHelpers');

const populateAttendance = (query) =>
  query
    .populate('userId', 'name email role managerId')
    .populate('validatedBy', 'name email role');

const getTeamMemberIds = async (managerId) => {
  const team = await User.find({ managerId, role: 'employee' }).select('_id');
  return team.map((u) => u._id);
};

const punchIn = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }

  const { latitude, longitude, selfie } = req.body;
  const date = getTodayDateKey();

  const existing = await Attendance.findOne({ userId: req.user._id, date });
  if (existing) {
    res.status(400);
    throw new Error('You have already punched in today');
  }

  const attendance = await Attendance.create({
    userId: req.user._id,
    date,
    punchIn: {
      time: new Date(),
      latitude,
      longitude,
      selfie,
    },
  });

  const populated = await populateAttendance(Attendance.findById(attendance._id));

  res.status(201).json({
    success: true,
    message: 'Punched in successfully',
    data: { attendance: populated },
  });
});

const punchOut = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }

  const { latitude, longitude, selfie } = req.body;
  const date = getTodayDateKey();

  const attendance = await Attendance.findOne({ userId: req.user._id, date });
  if (!attendance) {
    res.status(400);
    throw new Error('Please punch in before punching out');
  }
  if (attendance.punchOut) {
    res.status(400);
    throw new Error('You have already punched out today');
  }

  const punchOutTime = new Date();
  const workingHours = calculateWorkingHours(attendance.punchIn.time, punchOutTime);

  attendance.punchOut = {
    time: punchOutTime,
    latitude,
    longitude,
    selfie,
  };
  attendance.workingHours = workingHours;
  attendance.shiftStatus = getShiftStatus(workingHours);
  await attendance.save();

  const populated = await populateAttendance(Attendance.findById(attendance._id));

  res.json({
    success: true,
    message: 'Punched out successfully',
    data: { attendance: populated },
  });
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, from, to } = req.query;
  const filter = { userId: req.user._id };

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    populateAttendance(
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit))
    ),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      attendance: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  });
});

const getTodayAttendance = asyncHandler(async (req, res) => {
  const date = getTodayDateKey();
  const attendance = await populateAttendance(
    Attendance.findOne({ userId: req.user._id, date })
  );

  res.json({
    success: true,
    data: { attendance },
  });
});

const getTeamAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, date, from, to, userId } = req.query;
  const teamIds = await getTeamMemberIds(req.user._id);

  if (teamIds.length === 0) {
    return res.json({
      success: true,
      data: {
        attendance: [],
        pagination: { page: 1, limit: Number(limit), total: 0, pages: 1 },
      },
    });
  }

  const filter = { userId: { $in: teamIds } };
  if (userId) filter.userId = userId;
  if (date) {
    filter.date = date;
  } else if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    populateAttendance(
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit))
    ),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      attendance: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  });
});

const getAllAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, date, from, to, userId } = req.query;
  const filter = {};

  if (userId) filter.userId = userId;
  if (date) {
    filter.date = date;
  } else if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    populateAttendance(
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit))
    ),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      attendance: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  });
});

const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await populateAttendance(Attendance.findById(req.params.id));
  if (!attendance) {
    res.status(404);
    throw new Error('Attendance not found');
  }

  const role = req.user.role;
  if (role === 'employee' && String(attendance.userId._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not allowed to view this attendance');
  }

  if (role === 'manager') {
    const teamIds = await getTeamMemberIds(req.user._id);
    const isOwn = String(attendance.userId._id) === String(req.user._id);
    const isTeam = teamIds.some((id) => String(id) === String(attendance.userId._id));
    if (!isOwn && !isTeam) {
      res.status(403);
      throw new Error('Not allowed to view this attendance');
    }
  }

  res.json({
    success: true,
    data: { attendance },
  });
});

const validateAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }

  const { validationStatus, validationRemarks } = req.body;
  const attendance = await Attendance.findById(req.params.id).populate('userId', 'name managerId');

  if (!attendance) {
    res.status(404);
    throw new Error('Attendance not found');
  }

  if (req.user.role === 'manager') {
    const teamIds = await getTeamMemberIds(req.user._id);
    const isTeam = teamIds.some((id) => String(id) === String(attendance.userId._id));
    if (!isTeam) {
      res.status(403);
      throw new Error('You can only validate your team attendance');
    }
  }

  attendance.validationStatus = validationStatus;
  attendance.validationRemarks = validationRemarks || '';
  attendance.validatedBy = req.user._id;
  await attendance.save();

  const populated = await populateAttendance(Attendance.findById(attendance._id));

  res.json({
    success: true,
    message: `Attendance marked as ${validationStatus}`,
    data: { attendance: populated },
  });
});

module.exports = {
  punchIn,
  punchOut,
  getMyAttendance,
  getTodayAttendance,
  getTeamAttendance,
  getAllAttendance,
  getAttendanceById,
  validateAttendance,
  getTeamMemberIds,
};

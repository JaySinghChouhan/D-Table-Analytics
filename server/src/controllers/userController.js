const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { getTeamMemberIds } = require('./attendanceController');

const getUsers = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'manager') {
    const teamIds = await getTeamMemberIds(req.user._id);
    filter = { _id: { $in: teamIds } };
  }

  const users = await User.find(filter)
    .select('-password')
    .populate('managerId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { users },
  });
});

module.exports = { getUsers };

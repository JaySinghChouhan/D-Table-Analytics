const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/jwt');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error(`Role '${req.user.role}' is not allowed to access this resource`));
  }
  next();
};

module.exports = { protect, authorize };

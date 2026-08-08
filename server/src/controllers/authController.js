const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret, jwtExpiresIn } = require('../config/jwt');

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  managerId: user.managerId,
  createdAt: user.createdAt,
});

const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }

  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'employee',
  });

  const defaultManager = await User.findOne({ role: 'manager' }).sort({ createdAt: 1 });
  if (defaultManager) {
    user.managerId = defaultManager._id;
    await user.save();
  }

  res.status(201).json({
    success: true,
    message: 'Signup successful',
    data: {
      user: formatUser(user),
      token: generateToken(user._id),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: formatUser(user),
      token: generateToken(user._id),
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: formatUser(req.user) },
  });
});

module.exports = { signup, login, getMe };

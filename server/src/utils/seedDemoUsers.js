const User = require('../models/User');
const logger = require('../utils/logger');

const seedDemoUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    logger.info('Users already exist, skipping seed');
    return;
  }

  const manager = await User.create({
    name: 'Team Manager',
    email: 'manager@attendance.com',
    password: 'Manager@123',
    role: 'manager',
  });

  await User.create({
    name: 'System Admin',
    email: 'admin@attendance.com',
    password: 'Admin@123',
    role: 'admin',
  });

  await User.create([
    {
      name: 'Alice Employee',
      email: 'alice@attendance.com',
      password: 'Employee@123',
      role: 'employee',
      managerId: manager._id,
    },
    {
      name: 'Bob Employee',
      email: 'bob@attendance.com',
      password: 'Employee@123',
      role: 'employee',
      managerId: manager._id,
    },
    {
      name: 'Carol Employee',
      email: 'carol@attendance.com',
      password: 'Employee@123',
      role: 'employee',
      managerId: manager._id,
    },
  ]);

  logger.info('Demo users seeded (admin / manager / employees)');
};

module.exports = seedDemoUsers;

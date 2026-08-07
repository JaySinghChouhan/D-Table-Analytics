require('dotenv').config();
const connectDB = require('./config/db');
const seedDemoUsers = require('./utils/seedDemoUsers');
const User = require('./models/User');
const logger = require('./utils/logger');

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await seedDemoUsers();

    console.log('\nDemo accounts:');
    console.log('Admin   : admin@attendance.com / Admin@123');
    console.log('Manager : manager@attendance.com / Manager@123');
    console.log('Employee: alice@attendance.com / Employee@123');
    process.exit(0);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

seed();

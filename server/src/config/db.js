const mongoose = require('mongoose');
const logger = require('../utils/logger');

let memoryServer;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  if (process.env.USE_MEMORY_DB === 'true' || uri === 'memory') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('attendance_system');
    logger.info('Using in-memory MongoDB for local demo');
  }

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  // family: 4 forces IPv4 — required on many Render + Atlas setups
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    family: 4,
  });

  logger.info('MongoDB connected');
};

const stopMemoryDB = async () => {
  if (memoryServer) {
    await mongoose.disconnect();
    await memoryServer.stop();
  }
};

module.exports = connectDB;
module.exports.stopMemoryDB = stopMemoryDB;

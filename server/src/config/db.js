const mongoose = require('mongoose');
const logger = require('../utils/logger');

let memoryServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
  console.log(uri);

  if (process.env.USE_MEMORY_DB === 'true' || uri === 'memory') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('attendance_system');
    logger.info('Using in-memory MongoDB for local demo');
  }

  // if (!uri) {
  //   throw new Error('MONGODB_URI is not defined');
  // }

  await mongoose.connect(uri);
  logger.info('MongoDB connected');
  } catch (error) {
    console.log(error);
  }
  
};

const stopMemoryDB = async () => {
  if (memoryServer) {
    await mongoose.disconnect();
    await memoryServer.stop();
  }
};

module.exports = connectDB;
module.exports.stopMemoryDB = stopMemoryDB;

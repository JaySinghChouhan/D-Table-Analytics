const mongoose = require('mongoose');
const logger = require('../utils/logger');

let memoryServer;

const cleanMongoUri = (raw) => {
  let uri = String(raw || '').trim();
  if (!uri) return '';

  // Fix accidental markdown paste: [uri](uri)
  const markdownMatch = uri.match(/\((mongodb(?:\+srv)?:\/\/[^)\s]+)\)/i);
  if (markdownMatch) return markdownMatch[1];

  uri = uri.replace(/^['"]|['"]$/g, '');
  const plainMatch = uri.match(/mongodb(?:\+srv)?:\/\/\S+/i);
  return plainMatch ? plainMatch[0].replace(/[>\]]+$/, '') : uri;
};

const connectDB = async () => {
  let uri = cleanMongoUri(process.env.MONGODB_URI);

  if (process.env.USE_MEMORY_DB === 'true' || uri === 'memory') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('attendance_system');
    logger.info('Using in-memory MongoDB for local demo');
  }

  if (!uri) {
    throw new Error('MONGODB_URI is not defined on the server');
  }

  mongoose.set('bufferTimeoutMS', 30000);

  // family: 4 forces IPv4 — common fix for Render + Atlas timeouts
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    family: 4,
  });

  logger.info(`MongoDB connected (readyState=${mongoose.connection.readyState})`);
};

const stopMemoryDB = async () => {
  if (memoryServer) {
    await mongoose.disconnect();
    await memoryServer.stop();
  }
};

module.exports = connectDB;
module.exports.stopMemoryDB = stopMemoryDB;

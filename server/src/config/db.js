const mongoose = require('mongoose');
const logger = require('../utils/logger');

let memoryServer;
let usedMemoryFallback = false;

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

/** Default DB name matches Atlas explorer: test */
const ensureDbName = (uri, dbName = 'test') => {
  if (!uri || uri === 'memory') return uri;
  try {
    const parsed = new URL(uri);
    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = `/${dbName}`;
      return parsed.toString();
    }
  } catch (_) {
    if (/mongodb(?:\+srv)?:\/\/[^/]+\/?(\?|$)/.test(uri)) {
      return uri.replace(/\/?(\?|$)/, `/${dbName}$1`);
    }
  }
  return uri;
};

const startMemoryMongo = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  usedMemoryFallback = true;
  const uri = memoryServer.getUri('test');
  logger.warn('Using in-memory MongoDB (data will NOT appear in Atlas)');
  return uri;
};

const connectDB = async () => {
  let uri = cleanMongoUri(process.env.MONGODB_URI);
  uri = ensureDbName(uri, 'test');

  const allowMemory =
    process.env.USE_MEMORY_DB === 'true' ||
    uri === 'memory' ||
    process.env.ALLOW_MEMORY_FALLBACK === 'true';

  if (process.env.USE_MEMORY_DB === 'true' || uri === 'memory') {
    uri = await startMemoryMongo();
  }

  mongoose.set('bufferTimeoutMS', 30000);
  mongoose.set('strictQuery', true);

  const connectWithUri = async (targetUri) => {
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      family: 4,
    });
  };

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set on Render. Example: mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/test'
    );
  }

  try {
    await connectWithUri(uri);
  } catch (error) {
    logger.error(`Atlas connection failed: ${error.message}`);
    if (!allowMemory) {
      throw new Error(
        `Cannot reach MongoDB Atlas (${error.message}). In Atlas → Network Access, allow 0.0.0.0/0, then set MONGODB_URI on Render and redeploy.`
      );
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    uri = await startMemoryMongo();
    await connectWithUri(uri);
  }

  logger.info(
    `MongoDB connected db=${mongoose.connection.name} host=${mongoose.connection.host} memory=${usedMemoryFallback}`
  );
  return { usedMemoryFallback };
};

const stopMemoryDB = async () => {
  if (memoryServer) {
    await mongoose.disconnect();
    await memoryServer.stop();
  }
};

module.exports = connectDB;
module.exports.stopMemoryDB = stopMemoryDB;
module.exports.usedMemoryFallback = () => usedMemoryFallback;

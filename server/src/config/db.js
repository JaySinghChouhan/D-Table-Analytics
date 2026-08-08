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

/** Ensure URI targets a DB name. Atlas data for this project lives in `test`. */
const ensureDbName = (uri) => {
  if (!uri || uri === 'memory') return uri;
  try {
    const parsed = new URL(uri);
    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = '/test';
      return parsed.toString();
    }
  } catch (_) {
    // mongodb+srv sometimes parsed fine; if not, append /test before query
    if (/mongodb(?:\+srv)?:\/\/[^/]+\/?(\?|$)/.test(uri)) {
      return uri.replace(/\/?(\?|$)/, '/test$1');
    }
  }
  return uri;
};

const startMemoryMongo = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  usedMemoryFallback = true;
  const uri = memoryServer.getUri('test');
  logger.warn('Using in-memory MongoDB fallback (Atlas unreachable)');
  return uri;
};

const connectDB = async () => {
  let uri = cleanMongoUri(process.env.MONGODB_URI);
  uri = ensureDbName(uri);

  if (process.env.USE_MEMORY_DB === 'true' || uri === 'memory') {
    uri = await startMemoryMongo();
  }

  mongoose.set('bufferTimeoutMS', 30000);
  mongoose.set('strictQuery', true);

  const connectWithUri = async (targetUri) => {
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      family: 4,
    });
  };

  if (!uri) {
    logger.error('MONGODB_URI missing — starting memory fallback');
    uri = await startMemoryMongo();
    await connectWithUri(uri);
  } else {
    try {
      await connectWithUri(uri);
    } catch (error) {
      logger.error(`Atlas connection failed: ${error.message}`);
      // Keep the app usable on Render even if Network Access blocks the cluster
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
      uri = await startMemoryMongo();
      await connectWithUri(uri);
    }
  }

  logger.info(
    `MongoDB connected (readyState=${mongoose.connection.readyState}, memory=${usedMemoryFallback})`
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

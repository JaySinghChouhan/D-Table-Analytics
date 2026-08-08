const mongoose = require('mongoose');
const logger = require('../utils/logger');

const cleanMongoUri = (raw) => {
  let uri = String(raw || '').trim();
  if (!uri) return '';

  const markdownMatch = uri.match(/\((mongodb(?:\+srv)?:\/\/[^)\s]+)\)/i);
  if (markdownMatch) return markdownMatch[1];

  uri = uri.replace(/^['"]|['"]$/g, '');
  const plainMatch = uri.match(/mongodb(?:\+srv)?:\/\/\S+/i);
  return plainMatch ? plainMatch[0].replace(/[>\]]+$/, '') : uri;
};

/** Always use Atlas DB name `test` when URI has no DB path. */
const ensureDbName = (uri, dbName = 'test') => {
  if (!uri) return uri;
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

const connectDB = async () => {
  let uri = cleanMongoUri(process.env.MONGODB_URI);
  uri = ensureDbName(uri, 'test');

  if (!uri) {
    throw new Error(
      'MONGODB_URI is missing. Set it on Render to your Atlas URI, e.g. mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/test'
    );
  }

  // Production must use Atlas only — never silent in-memory DB
  if (process.env.NODE_ENV === 'production' && (uri === 'memory' || process.env.USE_MEMORY_DB === 'true')) {
    throw new Error('USE_MEMORY_DB/memory is not allowed in production. Use Atlas MONGODB_URI.');
  }

  mongoose.set('bufferTimeoutMS', 30000);
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    family: 4,
  });

  const host = mongoose.connection.host || '';
  const isAtlas = host.includes('mongodb.net');
  if (process.env.NODE_ENV === 'production' && !isAtlas) {
    await mongoose.disconnect().catch(() => {});
    throw new Error(`Production must connect to Atlas, got host=${host}`);
  }

  logger.info(`MongoDB connected db=${mongoose.connection.name} host=${host}`);
  return {
    usedMemoryFallback: false,
    dbName: mongoose.connection.name,
    dbHost: host,
    isAtlas,
  };
};

module.exports = connectDB;
module.exports.stopMemoryDB = async () => {};
module.exports.usedMemoryFallback = () => false;

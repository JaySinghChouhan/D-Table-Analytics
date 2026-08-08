/**
 * Starts a local MongoDB on 127.0.0.1:27017 for development.
 * Connect with MongoDB Compass using: mongodb://127.0.0.1:27017
 * Database name used by the app: attendance_system
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 27017;
const DB_PATH = path.join(__dirname, '..', '.mongo-data');

async function start() {
  fs.mkdirSync(DB_PATH, { recursive: true });

  console.log(`Starting local MongoDB on port ${PORT}...`);
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: PORT,
      dbPath: DB_PATH,
      storageEngine: 'wiredTiger',
    },
  });

  const uri = mongod.getUri();
  console.log('Local MongoDB is running');
  console.log(`URI: ${uri}`);
  console.log('Compass connection string: mongodb://127.0.0.1:27017');
  console.log('App database name: attendance_system');
  console.log('Keep this terminal open while developing.');
  console.log('Press Ctrl+C to stop MongoDB.');

  const stop = async () => {
    console.log('\nStopping MongoDB...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

start().catch((err) => {
  console.error('Failed to start local MongoDB:', err.message);
  console.error('If port 27017 is busy, stop the other MongoDB process and retry.');
  process.exit(1);
});

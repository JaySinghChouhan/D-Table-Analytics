require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./app');
const connectDB = require('./config/db');
const seedDemoUsers = require('./utils/seedDemoUsers');
const logger = require('./utils/logger');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    // Demo seed ONLY when explicitly requested (local demo). Never auto-seed on Render.
    if (process.env.AUTO_SEED === 'true' && process.env.NODE_ENV !== 'production') {
      await seedDemoUsers();
    }

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

start();

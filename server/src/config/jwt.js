const jwtSecret =
  process.env.JWT_SECRET || 'attendify-dev-secret-change-me-in-production';

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

module.exports = { jwtSecret, jwtExpiresIn };

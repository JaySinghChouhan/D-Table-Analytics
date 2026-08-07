const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'CastError') {
    statusCode = 400;
  } else if (err.code === 11000) {
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
  }

  logger.error(err.message, { stack: err.stack });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
    errors: err.errors || undefined,
  });
};

module.exports = { notFound, errorHandler };

/**
 * Global Error Handler Middleware
 * Must be registered LAST in Express middleware chain (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  // Default status: 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: Duplicate key violation (e.g., email/username already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 409;
  }

  // Mongoose: Validation errors (schema-level)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
    statusCode = 400;
  }

  // Mongoose: Invalid ObjectId cast
  if (err.name === 'CastError') {
    message = `Invalid ID format: ${err.value}`;
    statusCode = 400;
  }

  // Log error in non-production environments for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

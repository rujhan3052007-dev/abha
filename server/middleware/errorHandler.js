/**
 * ABHA Centralized Error Handling Middleware
 */

function errorHandler(err, req, res, next) {
  console.error('[ABHA Server Error]', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Uploaded file exceeds the maximum allowed size'
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An internal server error occurred. Please try again or contact ABHA support.'
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

module.exports = errorHandler;

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Resource already exists',
    });
  }

  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;

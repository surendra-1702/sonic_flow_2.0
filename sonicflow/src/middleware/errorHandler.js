function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  } else {
    console.error(err.message || 'Internal server error');
  }

  const status = err.status || 500;

  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;

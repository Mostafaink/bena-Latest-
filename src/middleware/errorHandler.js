const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;

import { isProduction } from '../config/env.js';
import HttpError from '../utils/httpError.js';

const notFound = (req, res, next) => {
  next(new HttpError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (!isProduction) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(isProduction ? {} : { stack: err.stack })
  });
};

export { notFound, errorHandler };
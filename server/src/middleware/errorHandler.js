import { sendError } from '../utils/response.js';
import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 'Validation Error', 400, messages);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, `A record with that ${field} already exists.`, 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Resource not found with id: ${err.value}`, 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    statusCode,
    config.nodeEnv === 'development' ? err.stack : undefined
  );
}

export function notFoundHandler(req, res) {
  return sendError(res, `Endpoint ${req.method} ${req.originalUrl} not found`, 404);
}

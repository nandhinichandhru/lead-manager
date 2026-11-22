import { ApiError } from '../utils/ApiError.js';
import { isProduction } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  let status = error.status instanceof Number || typeof error.status === 'number' ? error.status : 500;
  let message = error.message || 'Something went wrong';
  let errors = error.errors;

  // Translate common MySQL driver failures into friendly API errors.
  if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'A lead with these details already exists';
  } else if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
    status = 503;
    message = 'Database is unavailable. Please try again shortly.';
  } else if (error.code === 'ER_NO_SUCH_TABLE') {
    status = 503;
    message = 'The leads table is missing. Run `npm run db:init` first.';
  }

  if (status >= 500) {
    console.error(`[api] ${req.method} ${req.originalUrl} →`, isProduction ? error.message : error);
    if (isProduction) message = 'Internal server error';
  }

  res.status(status).json({
    message,
    ...(errors ? { errors } : {}),
    ...(!isProduction && status >= 500 ? { detail: error.message } : {}),
  });
}

export { ApiError };

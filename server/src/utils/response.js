export function sendSuccess(res, data = null, message = 'Success', statusCode = 200, meta = null) {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
}

export function sendError(res, message = 'An error occurred', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

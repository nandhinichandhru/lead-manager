/** Small error helper so controllers can throw consistent HTTP errors. */
export class ApiError extends Error {
  constructor(status, message, errors = undefined) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = 'Invalid request', errors) {
    return new ApiError(400, message, errors);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }
}

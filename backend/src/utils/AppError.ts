/**
 * Operational error that carries an HTTP status code.
 * All "expected" errors (bad input, not found, unauthorized, etc.) should
 * be thrown as AppError so the global error handler can format them cleanly.
 */
export class AppError extends Error {
  public readonly isOperational = true;

  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly errors?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

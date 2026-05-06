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

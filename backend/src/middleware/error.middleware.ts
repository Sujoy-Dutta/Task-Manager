import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    sendError(res, 'Validation failed.', 422, errors);
    return;
  }

  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0];
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    sendError(res, `${label} is already in use.`, 409);
    return;
  }


  if (err instanceof mongoose.Error.CastError && err.kind === 'ObjectId') {
    sendError(res, 'Invalid ID format.', 400);
    return;
  }

  const message = err.message
  sendError(res, message, 500);
}

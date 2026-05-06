import type { Response } from 'express';

interface SuccessPayload<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorPayload {
  success: false;
  message: string;
  errors?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<SuccessPayload<T>> {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
): Response<ErrorPayload> {
  return res
    .status(statusCode)
    .json({ success: false, message, ...(errors !== undefined ? { errors } : {}) });
}

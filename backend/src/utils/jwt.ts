import jwt from 'jsonwebtoken';
import { AppError } from './AppError';

const SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  sub: string; // user id
  iat?: number;
  exp?: number;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
  }
}

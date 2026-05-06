import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import User from '../models/User.model';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.taskmind_token;
    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const payload = verifyToken(token);

    const user = await User.findById(payload.sub).select('-password');
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

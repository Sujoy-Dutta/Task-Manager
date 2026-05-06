import type { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';

const COOKIE_NAME = 'taskmind_token';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// POST /api/auth/signup
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id.toString());

    setAuthCookie(res, token);
    sendSuccess(res, { user }, 'Account created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken(user._id.toString());

    setAuthCookie(res, token);
    sendSuccess(res, { user: user.toJSON() }, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export function getMe(req: Request, res: Response): void {
  sendSuccess(res, { user: req.user }, 'User retrieved successfully.');
}

// POST /api/auth/logout
export function logout(_req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  sendSuccess(res, null, 'Logged out successfully.');
}

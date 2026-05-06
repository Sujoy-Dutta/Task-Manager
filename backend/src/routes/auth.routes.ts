import { Router } from 'express';
import { signup, login, getMe, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { signupSchema, loginSchema } from '../schemas/auth.schema';
import { authRateLimiter, loginRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.post('/login',  authRateLimiter, loginRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me',      authMiddleware,  getMe);

export default router;

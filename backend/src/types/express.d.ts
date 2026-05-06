import type { IUserDocument } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      /** Set by authMiddleware after JWT verification */
      user?: IUserDocument;
    }
  }
}

export {};

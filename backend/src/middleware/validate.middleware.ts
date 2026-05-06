import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendError } from '../utils/apiResponse';

type Target = 'body' | 'params' | 'query';


export function validate(schema: z.ZodTypeAny, target: Target = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || undefined,
        message: issue.message,
      }));
      sendError(res, 'Validation failed.', 422, errors);
      return;
    }
    (req as any)[target] = result.data;
    next();
  };
}

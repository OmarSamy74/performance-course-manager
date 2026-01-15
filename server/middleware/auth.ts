import { Request, Response, NextFunction } from 'express';
import { getUserFromSession, extractToken } from '../utils/auth.js';

export interface AuthRequest extends Request {
  user?: any;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req.headers as any);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await getUserFromSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = user;
  next();
}

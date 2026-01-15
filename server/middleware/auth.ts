import { Request, Response, NextFunction } from 'express';
import { getUserFromSession, extractToken } from '../utils/auth.js';

export interface AuthRequest extends Request {
  user?: any;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req.headers as any);
  
  // Debug logging (remove in production if needed)
  if (!token) {
    console.log('🔍 Auth check failed - no token found');
    console.log('📋 Headers:', {
      authorization: req.headers.authorization,
      Authorization: req.headers.Authorization,
      allHeaders: Object.keys(req.headers)
    });
    return res.status(401).json({ error: 'Unauthorized', message: 'No authorization token provided' });
  }

  const user = await getUserFromSession(token);
  if (!user) {
    console.log('🔍 Auth check failed - invalid or expired token:', token.substring(0, 20) + '...');
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session' });
  }

  req.user = user;
  next();
}

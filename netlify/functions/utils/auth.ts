import { readData, writeData, findById } from './storage';
import { User, UserRole } from '../../../types';

export interface Session {
  id: string;
  userId: string;
  token: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a secure session token
 */
export function generateToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
}

/**
 * Create a new session
 */
export function createSession(userId: string, role: UserRole): Session {
  const now = Date.now();
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    token: generateToken(),
    role,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_DURATION).toISOString()
  };
  
  const sessions = readData<Session>('sessions');
  sessions.push(session);
  writeData('sessions', sessions);
  
  return session;
}

/**
 * Get session by token
 */
export function getSession(token: string): Session | null {
  const sessions = readData<Session>('sessions');
  const session = sessions.find(s => s.token === token);
  
  if (!session) return null;
  
  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    deleteSession(token);
    return null;
  }
  
  return session;
}

/**
 * Delete session
 */
export function deleteSession(token: string): void {
  const sessions = readData<Session>('sessions');
  const filtered = sessions.filter(s => s.token !== token);
  writeData('sessions', filtered);
}

/**
 * Clean expired sessions
 */
export function cleanExpiredSessions(): void {
  const sessions = readData<Session>('sessions');
  const now = new Date();
  const active = sessions.filter(s => new Date(s.expiresAt) > now);
  writeData('sessions', active);
}

/**
 * Get user from session
 */
export function getUserFromSession(token: string): User | null {
  const session = getSession(token);
  if (!session) return null;
  
  const users = readData<User>('users');
  const user = findById(users, session.userId);
  
  if (!user) {
    deleteSession(token);
    return null;
  }
  
  return user;
}

/**
 * Verify user has required role
 */
export function hasRole(session: Session | null, requiredRole: UserRole): boolean {
  if (!session) return false;
  
  // Admin has access to everything
  if (session.role === UserRole.ADMIN) return true;
  
  // Teacher has access to teacher and student features
  if (session.role === UserRole.TEACHER && requiredRole !== UserRole.ADMIN) return true;
  
  return session.role === requiredRole;
}

/**
 * Extract token from Authorization header
 */
export function extractToken(headers: Record<string, string | string[] | undefined>): string | null {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader) return null;
  
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (header.startsWith('Bearer ')) {
    return header.substring(7);
  }
  
  return header;
}

import { readData, findById, createById, deleteById } from './storage.js';
import { User, UserRole } from '../../types.js';

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
export async function createSession(userId: string, role: UserRole): Promise<Session> {
  const now = Date.now();
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    token: generateToken(),
    role,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_DURATION).toISOString()
  };
  
  await createById('sessions', session);
  
  return session;
}

/**
 * Get session by token
 */
export async function getSession(token: string): Promise<Session | null> {
  const sessions = await readData<Session>('sessions');
  const session = sessions.find(s => s.token === token);
  
  if (!session) return null;
  
  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(token);
    return null;
  }
  
  return session;
}

/**
 * Delete session
 */
export async function deleteSession(token: string): Promise<void> {
  const sessions = await readData<Session>('sessions');
  const session = sessions.find(s => s.token === token);
  if (session) {
    await deleteById('sessions', session.id);
  }
}

/**
 * Clean expired sessions
 */
export async function cleanExpiredSessions(): Promise<void> {
  const sessions = await readData<Session>('sessions');
  const now = new Date();
  const expired = sessions.filter(s => new Date(s.expiresAt) <= now);
  
  for (const session of expired) {
    await deleteById('sessions', session.id);
  }
}

/**
 * Get user from session
 */
export async function getUserFromSession(token: string): Promise<User | null> {
  const session = await getSession(token);
  if (!session) return null;
  
  const user = await findById<User>('users', session.userId);
  
  if (!user) {
    await deleteSession(token);
    return null;
  }
  
  return user;
}

/**
 * Verify user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === UserRole.ADMIN) return true;
  
  // Teacher has access to teacher and student features
  if (userRole === UserRole.TEACHER && requiredRole !== UserRole.ADMIN) return true;
  
  return userRole === requiredRole;
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

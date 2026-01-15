import { Router, Request, Response } from 'express';
import { createSession, getSession, deleteSession, getUserFromSession, extractToken } from '../utils/auth.js';
import { readData, findById, createById } from '../utils/storage.js';
import { User, UserRole } from '../../types.js';
import { isValidPhone } from '../utils/validation.js';
import { randomUUID } from 'crypto';

const router = Router();

// GET - Get current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const token = extractToken(req.headers as any);
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const user = await getUserFromSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    return res.json({ user });
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Login
router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Log for debugging (remove in production if needed)
    console.log('Login attempt:', { username, password: password ? '***' : undefined, bodyKeys: Object.keys(req.body) });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Trim whitespace from credentials
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Check hardcoded admin/teacher/sales
    let user: User | null = null;

    if (trimmedUsername === 'admin' && trimmedPassword === '123') {
      user = { id: 'admin', username: 'Administrator', role: UserRole.ADMIN };
    } else if (trimmedUsername === 'teacher' && trimmedPassword === '123') {
      user = { id: 'teacher', username: 'أ. المحاضر', role: UserRole.TEACHER };
    } else if (trimmedUsername === 'sales' && trimmedPassword === '123') {
      user = { id: 'sales1', username: 'Sales Agent', role: UserRole.SALES };
    } else if (trimmedUsername === 'omar.samy' && trimmedPassword === '123') {
      user = { id: 'omar.samy', username: 'Omar Samy', role: UserRole.TEACHER };
    } else if (trimmedUsername === 'abdelatif.reda' && trimmedPassword === '123') {
      user = { id: 'abdelatif.reda', username: 'Abdelatif Reda', role: UserRole.TEACHER };
    } else if (trimmedUsername === 'karim.ali' && trimmedPassword === '123') {
      user = { id: 'karim.ali', username: 'Karim Ali', role: UserRole.TEACHER };
    } else {
      // Check students
      const students = await readData<any>('students');
      const student = students.find((s: any) => s.phone === trimmedUsername);
      
      if (student && trimmedPassword === student.phone) {
        user = {
          id: student.id,
          username: student.name,
          role: UserRole.STUDENT,
          studentId: student.id
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Look up user by username (since PostgreSQL uses UUID for id)
    const allUsers = await readData<User>('users');
    let existingUser = allUsers.find((u: User) => u.username === user.username);
    
    // If user doesn't exist, create with a proper UUID
    if (!existingUser) {
      // Generate UUID for new user
      const userWithUUID: User = {
        ...user,
        id: randomUUID()
      };
      await createById('users', userWithUUID);
      existingUser = userWithUUID;
    }

    // Use the UUID from database for session creation
    const session = await createSession(existingUser.id, existingUser.role);

    return res.json({
      user: existingUser,
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE - Logout
router.delete('/', async (req: Request, res: Response) => {
  try {
    const token = extractToken(req.headers as any);
    if (token) {
      await deleteSession(token);
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

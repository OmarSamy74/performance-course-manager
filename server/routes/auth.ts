import { Router, Request, Response } from 'express';
import { createSession, getSession, deleteSession, getUserFromSession, extractToken } from '../utils/auth.js';
import { readData, findById, createById } from '../utils/storage.js';
import { User, UserRole } from '../../types.js';
import { isValidPhone } from '../utils/validation.js';

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

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check hardcoded admin/teacher/sales
    let user: User | null = null;

    if (username === 'admin' && password === '123') {
      user = { id: 'admin', username: 'Administrator', role: UserRole.ADMIN };
    } else if (username === 'teacher' && password === '123') {
      user = { id: 'teacher', username: 'أ. المحاضر', role: UserRole.TEACHER };
    } else if (username === 'sales' && password === '123') {
      user = { id: 'sales1', username: 'Sales Agent', role: UserRole.SALES };
    } else if (username === 'omar.samy' && password === '123') {
      user = { id: 'omar.samy', username: 'Omar Samy', role: UserRole.TEACHER };
    } else if (username === 'abdelatif.reda' && password === '123') {
      user = { id: 'abdelatif.reda', username: 'Abdelatif Reda', role: UserRole.TEACHER };
    } else if (username === 'karim.ali' && password === '123') {
      user = { id: 'karim.ali', username: 'Karim Ali', role: UserRole.TEACHER };
    } else {
      // Check students
      const students = await readData<any>('students');
      const student = students.find((s: any) => s.phone === username);
      
      if (student && password === student.phone) {
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

    // Create or update user in Firestore
    const existingUser = await findById<User>('users', user.id);
    if (!existingUser) {
      await createById('users', user);
    }

    const session = await createSession(user.id, user.role);

    return res.json({
      user,
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

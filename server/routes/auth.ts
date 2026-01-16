import { Router, Request, Response } from 'express';
import { createSession, getSession, deleteSession, getUserFromSession, extractToken } from '../utils/auth.js';
import { readData, findById, createById } from '../utils/storage.js';
import { User, UserRole } from '../../types.js';
import { isValidPhone } from '../utils/validation.js';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';

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

    // Look up user directly in PostgreSQL by username
    let existingUser: any = null;
    
    try {
      // First, try to find user in PostgreSQL database
      const dbResult = await pool.query(
        'SELECT id, username, password, role, student_id, course_id FROM users WHERE username = $1',
        [trimmedUsername]
      );
      
      if (dbResult.rows.length > 0) {
        existingUser = {
          id: dbResult.rows[0].id,
          username: dbResult.rows[0].username,
          password: dbResult.rows[0].password,
          role: dbResult.rows[0].role,
          studentId: dbResult.rows[0].student_id,
          courseId: dbResult.rows[0].course_id
        };
        
        // Verify password
        if (existingUser.password && !await bcrypt.compare(trimmedPassword, existingUser.password)) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      // Fallback to file-based storage if PostgreSQL fails
    }
    
    // If not found in PostgreSQL, check file-based storage (fallback)
    if (!existingUser) {
      const allUsers = await readData<any>('users');
      existingUser = allUsers.find((u: any) => u.username === trimmedUsername);
      
      if (existingUser) {
        // Verify password
        if (existingUser.password && !await bcrypt.compare(trimmedPassword, existingUser.password)) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }
    }
    
    // If user still doesn't exist and we have a hardcoded user, create it
    if (!existingUser && user) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
      
      // Generate UUID for new user
      const userId = randomUUID();
      
      try {
        // Try to insert into PostgreSQL
        await pool.query(
          'INSERT INTO users (id, username, password, role, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [userId, user.username, hashedPassword, user.role]
        );
        existingUser = {
          id: userId,
          username: user.username,
          password: hashedPassword,
          role: user.role
        };
      } catch (insertError: any) {
        // Fallback to file-based storage
        const userWithUUID: any = {
          ...user,
          id: userId,
          password: hashedPassword
        };
        await createById('users', userWithUUID);
        existingUser = userWithUUID;
      }
    }
    
    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Use the UUID from database for session creation
    const session = await createSession(existingUser.id, existingUser.role);

    // Remove password from response
    const { password: _, ...userResponse } = existingUser;
    
    return res.json({
      user: userResponse,
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

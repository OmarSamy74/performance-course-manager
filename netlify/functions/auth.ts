import { Handler } from '@netlify/functions';
import { createSession, getSession, deleteSession, getUserFromSession, extractToken } from './utils/auth';
import { readData, writeData, findById } from './utils/storage';
import { User, UserRole } from '../../types';
import { jsonResponse, errorResponse, handleOptions, isValidPhone } from './utils/validation';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const { httpMethod, headers, body } = event;
    
    // Log for debugging (remove in production if needed)
    console.log('Auth function called:', { httpMethod, path: event.path });

    // GET - Get current user
    if (httpMethod === 'GET') {
      const token = extractToken(headers);
      if (!token) {
        return errorResponse('No authorization token provided', 401);
      }

      const user = await getUserFromSession(token);
      if (!user) {
        return errorResponse('Invalid or expired session', 401);
      }

      return jsonResponse({ user });
    }

    // POST - Login
    if (httpMethod === 'POST') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const { username, password } = JSON.parse(body);

      if (!username || !password) {
        return errorResponse('Username and password are required');
      }

      // Check hardcoded admin/teacher/sales
      let user: User | null = null;

      if (username === 'admin' && password === '123') {
        user = { id: 'admin', username: 'Administrator', role: UserRole.ADMIN };
      } else if (username === 'teacher' && password === '123') {
        user = { id: 'teacher', username: 'أ. المحاضر', role: UserRole.TEACHER };
      } else if (username === 'sales' && password === '123') {
        user = { id: 'sales1', username: 'Sales Agent', role: UserRole.SALES };
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
        return errorResponse('Invalid credentials', 401);
      }

      // Look up user by username (since PostgreSQL uses UUID for id)
      const allUsers = await readData<User>('users');
      let existingUser = allUsers.find((u: User) => u.username === user.username);
      
      // If user doesn't exist, create with a proper UUID
      if (!existingUser) {
        // Generate UUID for new user
        const { randomUUID } = await import('crypto');
        const userWithUUID: User = {
          ...user,
          id: randomUUID()
        };
        await createById('users', userWithUUID);
        existingUser = userWithUUID;
      }

      // Use the UUID from database for session creation
      const session = await createSession(existingUser.id, existingUser.role);

      return jsonResponse({
        user: existingUser,
        token: session.token,
        expiresAt: session.expiresAt
      });
    }

    // DELETE - Logout
    if (httpMethod === 'DELETE') {
      const token = extractToken(headers);
      if (token) {
        deleteSession(token);
      }
      return jsonResponse({ message: 'Logged out successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Auth error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

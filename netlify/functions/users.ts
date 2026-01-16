import { Handler } from '@netlify/functions';
import { jsonResponse, errorResponse } from './utils/validation';
import { extractToken, getUserFromSession, hasRole } from './utils/auth';
import { UserRole } from '../../types';
import { getPool } from './utils/storage-pg';

export const handler: Handler = async (event, context) => {
  try {
    const httpMethod = event.httpMethod;
    const headers = event.headers || {};
    const body = event.body;

    // Require authentication
    const token = extractToken(headers);
    if (!token) {
      return errorResponse('No authorization token provided', 401);
    }

    const user = await getUserFromSession(token);
    if (!user) {
      return errorResponse('Invalid or expired session', 401);
    }

    // GET - List all users with passwords (Admin only)
    if (httpMethod === 'GET') {
      // Only admin can access this endpoint
      if (!hasRole(user.role, UserRole.ADMIN)) {
        return errorResponse('Forbidden: Admin access required', 403);
      }

      // Get all users from PostgreSQL
      const pool = await getPool();
      if (!pool) {
        return errorResponse('Database connection not available', 500);
      }
      const result = await pool.query(`
        SELECT 
          id,
          username,
          password,
          role,
          student_id,
          course_id,
          created_at
        FROM users
        ORDER BY created_at DESC
      `);

      const users = result.rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        password: row.password, // Include password hash
        role: row.role,
        studentId: row.student_id,
        courseId: row.course_id,
        createdAt: row.created_at
      }));

      return jsonResponse({
        users,
        count: users.length,
        note: 'Passwords are stored as bcrypt hashes. Use POST /users/update-passwords to generate new passwords.'
      });
    }

    // POST - Update all user passwords (Admin only)
    if (httpMethod === 'POST' && event.path?.endsWith('/update-passwords')) {
      // Only admin can access this endpoint
      if (!hasRole(user.role, UserRole.ADMIN)) {
        return errorResponse('Forbidden: Admin access required', 403);
      }

      const bcrypt = await import('bcryptjs');

      // Generate complex password function
      const generateComplexPassword = (): string => {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        const all = uppercase + lowercase + numbers + symbols;

        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        for (let i = password.length; i < 12; i++) {
          password += all[Math.floor(Math.random() * all.length)];
        }

        return password.split('').sort(() => Math.random() - 0.5).join('');
      };

      // Get all users
      const pool = await getPool();
      if (!pool) {
        return errorResponse('Database connection not available', 500);
      }
      const usersResult = await pool.query('SELECT id, username, role FROM users ORDER BY username');
      const users = usersResult.rows;

      if (users.length === 0) {
        return errorResponse('No users found', 404);
      }

      const passwordMap: Record<string, string> = {};

      // Update each user's password
      for (const dbUser of users) {
        const newPassword = generateComplexPassword();
        const hashedPassword = await bcrypt.default.hash(newPassword, 10);

        await pool.query(
          'UPDATE users SET password = $1 WHERE id = $2',
          [hashedPassword, dbUser.id]
        );

        passwordMap[dbUser.username] = newPassword;
      }

      return jsonResponse({
        message: `Successfully updated passwords for ${users.length} user(s)`,
        passwords: passwordMap,
        warning: 'Save these passwords securely! They cannot be recovered if lost.'
      });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Users error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

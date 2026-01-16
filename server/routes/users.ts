import { Router, Response } from 'express';
import { hasRole } from '../utils/auth.js';
import { UserRole } from '../../types.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import pool from '../db/connection.js';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/users
 * Get all users with passwords (Admin only)
 * Returns all users including password hashes
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin can access this endpoint
    if (!hasRole(user.role, UserRole.ADMIN)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    // Get all users from PostgreSQL
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
    
    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      password: row.password, // Include password hash
      role: row.role,
      studentId: row.student_id,
      courseId: row.course_id,
      createdAt: row.created_at
    }));
    
    return res.json({ 
      users,
      count: users.length,
      note: 'Passwords are stored as bcrypt hashes. Use /api/users/update-passwords to generate new passwords.'
    });
  } catch (error: any) {
    console.error('Users error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * POST /api/users/update-passwords
 * Update all user passwords (Admin only)
 * Generates new complex passwords for all users
 */
router.post('/update-passwords', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin can access this endpoint
    if (!hasRole(user.role, UserRole.ADMIN)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
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
    const usersResult = await pool.query('SELECT id, username, role FROM users ORDER BY username');
    const users = usersResult.rows;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    
    const passwordMap: Record<string, string> = {};
    
    // Update each user's password
    for (const dbUser of users) {
      const newPassword = generateComplexPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, dbUser.id]
      );
      
      passwordMap[dbUser.username] = newPassword;
    }
    
    return res.json({
      message: `Successfully updated passwords for ${users.length} user(s)`,
      passwords: passwordMap,
      warning: 'Save these passwords securely! They cannot be recovered if lost.'
    });
  } catch (error: any) {
    console.error('Update passwords error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

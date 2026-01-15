import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { readData, writeData, findById, updateById, deleteById } from '../utils/storage.js';
import { hasRole } from '../utils/auth.js';
import { UserRole, Student, PaymentPlan, InstallmentStatus } from '../../types.js';
import { isValidUUID } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET - List all or get one
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Admin and teacher can see all students
    if (hasRole(user.role, UserRole.ADMIN) || user.role === UserRole.TEACHER) {
      const students = await readData<Student>('students');
      return res.json({ students });
    }
    
    // Students can only see their own data
    if (user.role === UserRole.STUDENT && user.studentId) {
      const student = await findById<Student>('students', user.studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.json({ students: [student] });
    }
    
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    console.error('Students error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    
    // Admin and teacher can access any student
    if (hasRole(user.role, UserRole.ADMIN) || user.role === UserRole.TEACHER) {
      const student = await findById<Student>('students', id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.json({ student });
    }
    
    // Students can only access their own data
    if (user.role === UserRole.STUDENT && user.studentId === id) {
      const student = await findById<Student>('students', id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.json({ student });
    }
    
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    console.error('Students error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Create student
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin and teacher can access
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, phone, plan } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const students = await readData<Student>('students');
    const newStudent: Student = {
      id: randomUUID(),
      name,
      phone,
      plan: plan || PaymentPlan.HALF,
      installments: {
        inst1: { status: InstallmentStatus.UNPAID },
        inst2: { status: InstallmentStatus.UNPAID },
        inst3: { status: InstallmentStatus.UNPAID }
      },
      createdAt: new Date().toISOString()
    };

    students.push(newStudent);
    await writeData('students', students);

    return res.status(201).json({ student: newStudent });
  } catch (error: any) {
    console.error('Students error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT - Update student
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id, ...updates } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid student ID is required' });
    }

    // Admin and teacher can update any student
    if (hasRole(user.role, UserRole.ADMIN) || user.role === UserRole.TEACHER) {
      const updated = await updateById<Student>('students', id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.json({ student: updated });
    }
    
    // Students can only update their own data (e.g., upload payment proof)
    if (user.role === UserRole.STUDENT && user.studentId === id) {
      // Students can only update installments (for payment proof uploads)
      const allowedFields = ['installments'];
      const filteredUpdates: any = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(403).json({ error: 'Forbidden: Students can only update installments' });
      }
      
      const updated = await updateById<Student>('students', id, filteredUpdates);
      if (!updated) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.json({ student: updated });
    }
    
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    console.error('Students error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE - Delete student
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin and teacher can access
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid student ID is required' });
    }

    const deleted = await deleteById('students', id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error('Students error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

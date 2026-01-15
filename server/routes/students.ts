import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
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
    
    // Only admin and teacher can access
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const students = await readData<Student>('students');
    return res.json({ students });
  } catch (error: any) {
    console.error('Students error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin and teacher can access
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const student = await findById<Student>('students', id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    return res.json({ student });
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
    
    // Only admin and teacher can access
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, ...updates } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid student ID is required' });
    }

    const updated = await updateById<Student>('students', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ student: updated });
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

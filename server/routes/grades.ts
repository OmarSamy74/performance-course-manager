import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { readData, writeData, findById } from '../utils/storage.js';
import { hasRole } from '../utils/auth.js';
import { UserRole, Grade } from '../../types.js';
import { isValidUUID } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET - Get grades
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const studentId = user.studentId || user.id;

    // Students can only see their own grades
    if (user.role === UserRole.STUDENT) {
      const grades = await readData<Grade>('grades');
      const studentGrades = grades.filter(g => g.studentId === studentId);
      return res.json({ grades: studentGrades });
    }

    // Teachers/Admins can see all grades or filter by student
    const filterStudentId = req.query.studentId as string;
    const grades = await readData<Grade>('grades');

    if (filterStudentId) {
      const filteredGrades = grades.filter(g => g.studentId === filterStudentId);
      return res.json({ grades: filteredGrades });
    }

    return res.json({ grades });
  } catch (error: any) {
    console.error('Grades error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Create grade from assignment or quiz
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { assignmentId, quizId, studentId, score, maxScore, feedback } = req.body;

    if (!studentId || score === undefined || maxScore === undefined) {
      return res.status(400).json({ error: 'Student ID, score, and max score are required' });
    }

    if (!assignmentId && !quizId) {
      return res.status(400).json({ error: 'Either assignment ID or quiz ID is required' });
    }

    // Check if grade already exists
    const grades = await readData<Grade>('grades');
    const existing = grades.find(
      g => g.studentId === studentId && 
      ((assignmentId && g.assignmentId === assignmentId) || (quizId && g.quizId === quizId))
    );

    if (existing) {
      return res.status(400).json({ error: 'Grade already exists for this assignment/quiz' });
    }

    const percentage = (score / maxScore) * 100;
    const now = new Date().toISOString();

    const grade: Grade = {
      id: randomUUID(),
      studentId,
      assignmentId: assignmentId || undefined,
      quizId: quizId || undefined,
      score,
      maxScore,
      percentage,
      feedback: feedback || undefined,
      gradedBy: user.id,
      gradedAt: now,
      createdAt: now
    };

    grades.push(grade);
    await writeData('grades', grades);

    return res.status(201).json({ grade });
  } catch (error: any) {
    console.error('Grades error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT - Update grade
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, score, maxScore, feedback } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid grade ID is required' });
    }

    const grades = await readData<Grade>('grades');
    const grade = await findById<Grade>('grades', id);
    
    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    const updatedScore = score !== undefined ? score : grade.score;
    const updatedMaxScore = maxScore !== undefined ? maxScore : grade.maxScore;
    const percentage = (updatedScore / updatedMaxScore) * 100;

    const updated = {
      ...grade,
      score: updatedScore,
      maxScore: updatedMaxScore,
      percentage,
      feedback: feedback !== undefined ? feedback : grade.feedback,
      gradedAt: new Date().toISOString()
    };

    const index = grades.findIndex(g => g.id === id);
    grades[index] = updated;
    await writeData('grades', grades);

    return res.json({ grade: updated });
  } catch (error: any) {
    console.error('Grades error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

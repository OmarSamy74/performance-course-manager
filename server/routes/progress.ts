import { Router, Response } from 'express';
import { readData, writeData, findById, updateById } from '../utils/storage.js';
import { StudentProgress, Lesson } from '../../types.js';
import { isValidUUID } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET - Get progress
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const studentId = user.studentId || user.id;
    const progress = await readData<StudentProgress>('progress');
    const studentProgress = progress.filter(p => p.studentId === studentId);
    return res.json({ progress: studentProgress });
  } catch (error: any) {
    console.error('Progress error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const studentId = user.studentId || user.id;
    const progress = await readData<StudentProgress>('progress');
    const lessons = await readData<Lesson>('lessons');
    
    const studentProgress = progress.filter(p => p.studentId === studentId);
    const totalLessons = lessons.length;
    const completedLessons = studentProgress.filter(p => p.completed).length;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;
    
    const totalTimeSpent = studentProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const lastActivity = studentProgress.length > 0
      ? studentProgress.sort((a, b) => 
          new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
        )[0].lastAccessedAt
      : new Date().toISOString();

    return res.json({
      totalLessons,
      completedLessons,
      completionPercentage,
      totalTimeSpent,
      lastActivityAt: lastActivity
    });
  } catch (error: any) {
    console.error('Progress error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const studentId = user.studentId || user.id;
    const { lessonId } = req.params;
    
    if (!isValidUUID(lessonId)) {
      return res.status(400).json({ error: 'Valid lesson ID is required' });
    }
    
    const progress = await readData<StudentProgress>('progress');
    const lessonProgress = progress.find(
      p => p.studentId === studentId && p.lessonId === lessonId
    );
    
    return res.json({ progress: lessonProgress || null });
  } catch (error: any) {
    console.error('Progress error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST/PUT - Update progress
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, completed, progress: progressValue, timeSpent } = req.body;

    if (!lessonId || !isValidUUID(lessonId)) {
      return res.status(400).json({ error: 'Valid lesson ID is required' });
    }

    const user = req.user!;
    const studentId = user.studentId || user.id;
    const progress = await readData<StudentProgress>('progress');
    const existing = progress.find(
      p => p.studentId === studentId && p.lessonId === lessonId
    );

    const now = new Date().toISOString();
    const progressData: StudentProgress = {
      id: existing?.id || crypto.randomUUID(),
      studentId,
      lessonId,
      completed: completed !== undefined ? completed : existing?.completed || false,
      progress: progressValue !== undefined ? progressValue : existing?.progress || 0,
      timeSpent: (existing?.timeSpent || 0) + (timeSpent || 0),
      lastAccessedAt: now,
      completedAt: completed ? (existing?.completedAt || now) : existing?.completedAt
    };

    if (existing) {
      await updateById('progress', existing.id, progressData);
    } else {
      progress.push(progressData);
      await writeData('progress', progress);
    }

    return res.json({ progress: progressData });
  } catch (error: any) {
    console.error('Progress error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

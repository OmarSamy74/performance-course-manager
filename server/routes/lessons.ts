import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { readData, writeData, findById, updateById, deleteById } from '../utils/storage.js';
import { hasRole } from '../utils/auth.js';
import { UserRole, Lesson } from '../../types.js';
import { isValidUUID } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET - List all or get one
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const lessons = await readData<Lesson>('lessons');
    
    // Sort by module and order
    const sorted = [...lessons].sort((a, b) => {
      if (a.moduleId !== b.moduleId) {
        return a.moduleId.localeCompare(b.moduleId);
      }
      return a.order - b.order;
    });
    
    return res.json({ lessons: sorted });
  } catch (error: any) {
    console.error('Lessons error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await findById<Lesson>('lessons', id);
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    return res.json({ lesson });
  } catch (error: any) {
    console.error('Lessons error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Create lesson (only teacher/admin)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, description, content, videoUrl, moduleId, order, duration, prerequisites } = req.body;

    if (!title || !moduleId) {
      return res.status(400).json({ error: 'Title and module ID are required' });
    }

    const lessons = await readData<Lesson>('lessons');
    const newLesson: Lesson = {
      id: randomUUID(),
      title,
      description: description || '',
      content: content || '',
      videoUrl: videoUrl || undefined,
      moduleId,
      order: order || lessons.filter(l => l.moduleId === moduleId).length + 1,
      duration: duration || undefined,
      prerequisites: prerequisites || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    lessons.push(newLesson);
    await writeData('lessons', lessons);

    return res.status(201).json({ lesson: newLesson });
  } catch (error: any) {
    console.error('Lessons error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT - Update lesson (only teacher/admin)
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, ...updates } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid lesson ID is required' });
    }

    updates.updatedAt = new Date().toISOString();
    const updated = await updateById<Lesson>('lessons', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    return res.json({ lesson: updated });
  } catch (error: any) {
    console.error('Lessons error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE - Delete lesson (only teacher/admin)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid lesson ID is required' });
    }

    const deleted = await deleteById('lessons', id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    return res.json({ message: 'Lesson deleted successfully' });
  } catch (error: any) {
    console.error('Lessons error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

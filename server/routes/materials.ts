import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { readData, writeData, findById, updateById, deleteById } from '../utils/storage.js';
import { hasRole } from '../utils/auth.js';
import { UserRole, CourseMaterial } from '../../types.js';
import { isValidUUID } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET - List all or get one
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const materials = await readData<CourseMaterial>('materials');
    return res.json({ materials });
  } catch (error: any) {
    console.error('Materials error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const material = await findById<CourseMaterial>('materials', id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    return res.json({ material });
  } catch (error: any) {
    console.error('Materials error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Create material (only teacher/admin)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, description, fileUrl, fileType } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ error: 'Title and file URL are required' });
    }

    const materials = await readData<CourseMaterial>('materials');
    const newMaterial: CourseMaterial = {
      id: randomUUID(),
      title,
      description: description || '',
      fileUrl,
      fileType: fileType || 'PDF',
      createdAt: new Date().toISOString()
    };

    materials.push(newMaterial);
    await writeData('materials', materials);

    return res.status(201).json({ material: newMaterial });
  } catch (error: any) {
    console.error('Materials error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT - Update material (only teacher/admin)
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, ...updates } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid material ID is required' });
    }

    const updated = await updateById<CourseMaterial>('materials', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Material not found' });
    }

    return res.json({ material: updated });
  } catch (error: any) {
    console.error('Materials error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE - Delete material (only teacher/admin)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid material ID is required' });
    }

    const deleted = await deleteById('materials', id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Material not found' });
    }

    return res.json({ message: 'Material deleted successfully' });
  } catch (error: any) {
    console.error('Materials error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

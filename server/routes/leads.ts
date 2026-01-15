import { Router, Response } from 'express';
import { readData, writeData, findById, updateById, deleteById } from '../utils/storage.js';
import { hasRole } from '../utils/auth.js';
import { UserRole, Lead, LeadStatus } from '../../types.js';
import { isValidUUID } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET - List all or get one
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin, teacher, and sales can access
    if (!hasRole(user.role, UserRole.ADMIN) && 
        user.role !== UserRole.TEACHER && 
        user.role !== UserRole.SALES) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const leads = await readData<Lead>('leads');
    return res.json({ leads });
  } catch (error: any) {
    console.error('Leads error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin, teacher, and sales can access
    if (!hasRole(user.role, UserRole.ADMIN) && 
        user.role !== UserRole.TEACHER && 
        user.role !== UserRole.SALES) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const lead = await findById<Lead>('leads', id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    return res.json({ lead });
  } catch (error: any) {
    console.error('Leads error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Create lead
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin, teacher, and sales can access
    if (!hasRole(user.role, UserRole.ADMIN) && 
        user.role !== UserRole.TEACHER && 
        user.role !== UserRole.SALES) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, phone, source, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const leads = await readData<Lead>('leads');
    const newLead: Lead = {
      id: crypto.randomUUID(),
      name,
      phone,
      status: LeadStatus.NEW,
      source: source || 'Direct',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    leads.push(newLead);
    await writeData('leads', leads);

    return res.status(201).json({ lead: newLead });
  } catch (error: any) {
    console.error('Leads error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT - Update lead
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin, teacher, and sales can access
    if (!hasRole(user.role, UserRole.ADMIN) && 
        user.role !== UserRole.TEACHER && 
        user.role !== UserRole.SALES) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, ...updates } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid lead ID is required' });
    }

    const updated = await updateById<Lead>('leads', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.json({ lead: updated });
  } catch (error: any) {
    console.error('Leads error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE - Delete lead
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admin, teacher, and sales can access
    if (!hasRole(user.role, UserRole.ADMIN) && 
        user.role !== UserRole.TEACHER && 
        user.role !== UserRole.SALES) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid lead ID is required' });
    }

    const deleted = await deleteById('leads', id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Leads error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

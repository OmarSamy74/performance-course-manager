import { Router, Response } from 'express';
import { readData, writeData, findById, updateById, deleteById } from '../utils/storage.js';
import { hasRole } from '../utils/auth.js';
import { UserRole, Assignment, AssignmentSubmission, AssignmentStatus, SubmissionStatus } from '../../types.js';
import { isValidUUID, validateDate } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET - List assignments or get one
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await readData<Assignment>('assignments');
    return res.json({ assignments });
  } catch (error: any) {
    console.error('Assignments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await findById<Assignment>('assignments', id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    return res.json({ assignment });
  } catch (error: any) {
    console.error('Assignments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id: assignmentId } = req.params;
    const submissions = await readData<AssignmentSubmission>('submissions');
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
    
    // Students can only see their own submissions
    if (user.role === UserRole.STUDENT) {
      const studentSubmissions = assignmentSubmissions.filter(s => s.studentId === user.studentId);
      return res.json({ submissions: studentSubmissions });
    }
    
    return res.json({ submissions: assignmentSubmissions });
  } catch (error: any) {
    console.error('Assignments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Create assignment or submit assignment
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { title, description, dueDate, maxScore } = req.body;

    // Create assignment (teacher/admin)
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' });
    }

    const dateError = validateDate(dueDate, 'Due date');
    if (dateError) {
      return res.status(400).json({ error: dateError });
    }

    const assignments = await readData<Assignment>('assignments');
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      title,
      description: description || '',
      dueDate,
      status: AssignmentStatus.PUBLISHED,
      maxScore: maxScore || 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    assignments.push(newAssignment);
    await writeData('assignments', assignments);

    return res.status(201).json({ assignment: newAssignment });
  } catch (error: any) {
    console.error('Assignments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/submit', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (user.role !== UserRole.STUDENT) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { assignmentId, fileUrl } = req.body;
    if (!assignmentId || !fileUrl) {
      return res.status(400).json({ error: 'Assignment ID and file URL are required' });
    }

    const assignments = await readData<Assignment>('assignments');
    const assignment = await findById<Assignment>('assignments', assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    const submissions = await readData<AssignmentSubmission>('submissions');
    const submission: AssignmentSubmission = {
      id: crypto.randomUUID(),
      assignmentId,
      studentId: user.studentId!,
      status: SubmissionStatus.SUBMITTED,
      fileUrl,
      submittedAt: now.toISOString(),
      isLate,
      createdAt: now.toISOString()
    };

    submissions.push(submission);
    await writeData('submissions', submissions);

    return res.status(201).json({ submission });
  } catch (error: any) {
    console.error('Assignments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT - Update assignment or grade submission
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id, submissionId, score, feedback, ...updates } = req.body;

    // Grade submission (teacher/admin)
    if (submissionId) {
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const submissions = await readData<AssignmentSubmission>('submissions');
      const submission = await findById<AssignmentSubmission>('submissions', submissionId);
      
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      const updated = await updateById<AssignmentSubmission>('submissions', submissionId, {
        status: SubmissionStatus.GRADED,
        score,
        feedback,
        gradedAt: new Date().toISOString()
      });

      return res.json({ submission: updated });
    }

    // Update assignment (teacher/admin)
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid assignment ID is required' });
    }

    updates.updatedAt = new Date().toISOString();
    const updated = await updateById<Assignment>('assignments', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    return res.json({ assignment: updated });
  } catch (error: any) {
    console.error('Assignments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE - Delete assignment (teacher/admin)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid assignment ID is required' });
    }

    const deleted = await deleteById('assignments', id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Also delete related submissions
    const submissions = await readData<AssignmentSubmission>('submissions');
    const filteredSubmissions = submissions.filter(s => s.assignmentId !== id);
    await writeData('submissions', filteredSubmissions);

    return res.json({ message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Assignments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

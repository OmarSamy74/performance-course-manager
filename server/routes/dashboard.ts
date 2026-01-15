import { Router, Response } from 'express';
import { readData } from '../utils/storage.js';
import { Student, Lead, LeadStatus, PaymentPlan, COURSE_COST, InstallmentStatus } from '../../types.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function calculateFinancials(student: Student) {
  let paid = 0;
  
  if (student.plan === PaymentPlan.FULL) {
    paid = COURSE_COST;
  } else {
    paid = 3000; // HALF_PAYMENT_INITIAL
    
    if (student.installments.inst1.status === InstallmentStatus.PAID) paid += 1000;
    if (student.installments.inst2.status === InstallmentStatus.PAID) paid += 1000;
    if (student.installments.inst3.status === InstallmentStatus.PAID) paid += 1000;
  }

  const remaining = COURSE_COST - paid;
  
  return { paid, remaining, isFullyPaid: remaining === 0 };
}

// GET - Get dashboard stats
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const students = await readData<Student>('students');
    const leads = await readData<Lead>('leads');

    // Financial stats
    let totalExpected = students.length * COURSE_COST;
    let totalCollected = 0;
    let totalRemaining = 0;
    let fullPaidCount = 0;
    let pendingReviews = 0;

    students.forEach((s: Student) => {
      const { paid, remaining, isFullyPaid } = calculateFinancials(s);
      totalCollected += paid;
      totalRemaining += remaining;
      if (isFullyPaid) fullPaidCount++;

      if (s.installments.inst1.status === InstallmentStatus.PENDING) pendingReviews++;
      if (s.installments.inst2.status === InstallmentStatus.PENDING) pendingReviews++;
      if (s.installments.inst3.status === InstallmentStatus.PENDING) pendingReviews++;
    });

    // CRM stats
    const totalLeads = leads.length;
    const newLeads = leads.filter((l: Lead) => l.status === LeadStatus.NEW).length;
    const interested = leads.filter((l: Lead) => l.status === LeadStatus.INTERESTED).length;
    const converted = leads.filter((l: Lead) => l.status === LeadStatus.CONVERTED).length;
    const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

    return res.json({
      financial: {
        totalExpected,
        totalCollected,
        totalRemaining,
        fullPaidCount,
        pendingReviews,
        totalStudents: students.length
      },
      crm: {
        totalLeads,
        newLeads,
        interested,
        converted,
        conversionRate
      }
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

import { Handler } from '@netlify/functions';
import { readData } from './utils/storage';
import { getUserFromSession, extractToken } from './utils/auth';
import { Student, Lead, LeadStatus, PaymentPlan, COURSE_COST, InstallmentStatus } from '../../types';
import { jsonResponse, errorResponse, handleOptions } from './utils/validation';

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

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const token = extractToken(event.headers);
    const user = token ? getUserFromSession(token) : null;

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (event.httpMethod !== 'GET') {
      return errorResponse('Method not allowed', 405);
    }

    const students = readData<Student>('students');
    const leads = readData<Lead>('leads');

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

    return jsonResponse({
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
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

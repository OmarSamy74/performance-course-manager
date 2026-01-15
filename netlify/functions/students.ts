import { Handler } from '@netlify/functions';
import { readData, writeData, findById, updateById, deleteById } from './utils/storage';
import { getUserFromSession, extractToken, hasRole } from './utils/auth';
import { UserRole, Student, PaymentPlan, InstallmentStatus } from '../../types';
import { jsonResponse, errorResponse, handleOptions, isValidUUID } from './utils/validation';

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

    // Only admin and teacher can access
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return errorResponse('Forbidden', 403);
    }

    const { httpMethod, body, path } = event;
    const students = readData<Student>('students');

    // GET - List all or get one
    if (httpMethod === 'GET') {
      const id = path?.split('/').pop();
      if (id && id !== 'students') {
        const student = findById(students, id);
        if (!student) {
          return errorResponse('Student not found', 404);
        }
        return jsonResponse({ student });
      }
      return jsonResponse({ students });
    }

    // POST - Create student
    if (httpMethod === 'POST') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { name, phone, plan } = data;

      if (!name || !phone) {
        return errorResponse('Name and phone are required');
      }

      const newStudent: Student = {
        id: crypto.randomUUID(),
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
      writeData('students', students);

      return jsonResponse({ student: newStudent }, 201);
    }

    // PUT - Update student
    if (httpMethod === 'PUT') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { id, ...updates } = data;

      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid student ID is required');
      }

      const updated = updateById(students, id, updates);
      if (!updated) {
        return errorResponse('Student not found', 404);
      }

      writeData('students', students);
      return jsonResponse({ student: updated });
    }

    // DELETE - Delete student
    if (httpMethod === 'DELETE') {
      const id = path?.split('/').pop();
      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid student ID is required');
      }

      const deleted = deleteById(students, id);
      if (!deleted) {
        return errorResponse('Student not found', 404);
      }

      writeData('students', students);
      return jsonResponse({ message: 'Student deleted successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Students error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

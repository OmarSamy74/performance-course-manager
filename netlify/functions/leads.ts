import { Handler } from '@netlify/functions';
import { readData, writeData, findById, updateById, deleteById } from './utils/storage';
import { getUserFromSession, extractToken, hasRole } from './utils/auth';
import { UserRole, Lead, LeadStatus } from '../../types';
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

    // Only admin, teacher, and sales can access
    if (!hasRole(user.role, UserRole.ADMIN) && 
        user.role !== UserRole.TEACHER && 
        user.role !== UserRole.SALES) {
      return errorResponse('Forbidden', 403);
    }

    const { httpMethod, body, path } = event;
    const leads = readData<Lead>('leads');

    // GET - List all or get one
    if (httpMethod === 'GET') {
      const id = path?.split('/').pop();
      if (id && id !== 'leads') {
        const lead = findById(leads, id);
        if (!lead) {
          return errorResponse('Lead not found', 404);
        }
        return jsonResponse({ lead });
      }
      return jsonResponse({ leads });
    }

    // POST - Create lead
    if (httpMethod === 'POST') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { name, phone, source, notes } = data;

      if (!name || !phone) {
        return errorResponse('Name and phone are required');
      }

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
      writeData('leads', leads);

      return jsonResponse({ lead: newLead }, 201);
    }

    // PUT - Update lead
    if (httpMethod === 'PUT') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { id, ...updates } = data;

      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid lead ID is required');
      }

      const updated = updateById(leads, id, updates);
      if (!updated) {
        return errorResponse('Lead not found', 404);
      }

      writeData('leads', leads);
      return jsonResponse({ lead: updated });
    }

    // DELETE - Delete lead
    if (httpMethod === 'DELETE') {
      const id = path?.split('/').pop();
      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid lead ID is required');
      }

      const deleted = deleteById(leads, id);
      if (!deleted) {
        return errorResponse('Lead not found', 404);
      }

      writeData('leads', leads);
      return jsonResponse({ message: 'Lead deleted successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Leads error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

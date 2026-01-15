import { Handler } from '@netlify/functions';
import { readData, writeData, findById, updateById, deleteById } from './utils/storage';
import { getUserFromSession, extractToken, hasRole } from './utils/auth';
import { UserRole, CourseMaterial } from '../../types';
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

    const { httpMethod, body, path } = event;
    const materials = readData<CourseMaterial>('materials');

    // GET - List all or get one (students can view)
    if (httpMethod === 'GET') {
      const id = path?.split('/').pop();
      if (id && id !== 'materials') {
        const material = findById(materials, id);
        if (!material) {
          return errorResponse('Material not found', 404);
        }
        return jsonResponse({ material });
      }
      return jsonResponse({ materials });
    }

    // POST - Create material (only teacher/admin)
    if (httpMethod === 'POST') {
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { title, description, fileUrl, fileType } = data;

      if (!title || !fileUrl) {
        return errorResponse('Title and file URL are required');
      }

      const newMaterial: CourseMaterial = {
        id: crypto.randomUUID(),
        title,
        description: description || '',
        fileUrl,
        fileType: fileType || 'PDF',
        createdAt: new Date().toISOString()
      };

      materials.push(newMaterial);
      writeData('materials', materials);

      return jsonResponse({ material: newMaterial }, 201);
    }

    // PUT - Update material (only teacher/admin)
    if (httpMethod === 'PUT') {
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { id, ...updates } = data;

      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid material ID is required');
      }

      const updated = updateById(materials, id, updates);
      if (!updated) {
        return errorResponse('Material not found', 404);
      }

      writeData('materials', materials);
      return jsonResponse({ material: updated });
    }

    // DELETE - Delete material (only teacher/admin)
    if (httpMethod === 'DELETE') {
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      const id = path?.split('/').pop();
      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid material ID is required');
      }

      const deleted = deleteById(materials, id);
      if (!deleted) {
        return errorResponse('Material not found', 404);
      }

      writeData('materials', materials);
      return jsonResponse({ message: 'Material deleted successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Materials error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

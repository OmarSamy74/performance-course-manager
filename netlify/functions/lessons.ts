import { Handler } from '@netlify/functions';
import { readData, writeData, findById, updateById, deleteById } from './utils/storage';
import { getUserFromSession, extractToken, hasRole } from './utils/auth';
import { UserRole, Lesson } from '../../types';
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
    const lessons = readData<Lesson>('lessons');

    // GET - List all or get one (all authenticated users can view)
    if (httpMethod === 'GET') {
      const id = path?.split('/').pop();
      if (id && id !== 'lessons') {
        const lesson = findById(lessons, id);
        if (!lesson) {
          return errorResponse('Lesson not found', 404);
        }
        return jsonResponse({ lesson });
      }
      
      // Sort by module and order
      const sorted = [...lessons].sort((a, b) => {
        if (a.moduleId !== b.moduleId) {
          return a.moduleId.localeCompare(b.moduleId);
        }
        return a.order - b.order;
      });
      
      return jsonResponse({ lessons: sorted });
    }

    // POST - Create lesson (only teacher/admin)
    if (httpMethod === 'POST') {
      if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { title, description, content, videoUrl, moduleId, order, duration, prerequisites } = data;

      if (!title || !moduleId) {
        return errorResponse('Title and module ID are required');
      }

      const newLesson: Lesson = {
        id: crypto.randomUUID(),
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
      writeData('lessons', lessons);

      return jsonResponse({ lesson: newLesson }, 201);
    }

    // PUT - Update lesson (only teacher/admin)
    if (httpMethod === 'PUT') {
      if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { id, ...updates } = data;

      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid lesson ID is required');
      }

      updates.updatedAt = new Date().toISOString();
      const updated = updateById(lessons, id, updates);
      if (!updated) {
        return errorResponse('Lesson not found', 404);
      }

      writeData('lessons', lessons);
      return jsonResponse({ lesson: updated });
    }

    // DELETE - Delete lesson (only teacher/admin)
    if (httpMethod === 'DELETE') {
      if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      const id = path?.split('/').pop();
      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid lesson ID is required');
      }

      const deleted = deleteById(lessons, id);
      if (!deleted) {
        return errorResponse('Lesson not found', 404);
      }

      writeData('lessons', lessons);
      return jsonResponse({ message: 'Lesson deleted successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Lessons error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

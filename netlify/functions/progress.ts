import { Handler } from '@netlify/functions';
import { readData, writeData, findById, updateById } from './utils/storage';
import { getUserFromSession, extractToken } from './utils/auth';
import { StudentProgress, Lesson } from '../../types';
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
    const progress = readData<StudentProgress>('progress');
    const lessons = readData<Lesson>('lessons');

    // GET - Get progress
    if (httpMethod === 'GET') {
      const studentId = user.studentId || user.id;
      
      // Get course progress summary
      const pathParts = path?.split('/').filter(Boolean);
      const lastPart = pathParts?.[pathParts.length - 1];
      
      if (lastPart === 'summary') {
        const studentProgress = progress.filter(p => p.studentId === studentId);
        const totalLessons = lessons.length;
        const completedLessons = studentProgress.filter(p => p.completed).length;
        const completionPercentage = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0;
        
        const totalTimeSpent = studentProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const lastActivity = studentProgress.length > 0
          ? studentProgress.sort((a, b) => 
              new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
            )[0].lastAccessedAt
          : new Date().toISOString();

        return jsonResponse({
          totalLessons,
          completedLessons,
          completionPercentage,
          totalTimeSpent,
          lastActivityAt: lastActivity
        });
      }

      // Get specific lesson progress
      const lessonId = pathParts?.[pathParts.length - 1];
      if (lessonId && isValidUUID(lessonId)) {
        const lessonProgress = progress.find(
          p => p.studentId === studentId && p.lessonId === lessonId
        );
        return jsonResponse({ progress: lessonProgress || null });
      }

      // Get all progress for student
      const studentProgress = progress.filter(p => p.studentId === studentId);
      return jsonResponse({ progress: studentProgress });
    }

    // POST/PUT - Update progress
    if (httpMethod === 'POST' || httpMethod === 'PUT') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { lessonId, completed, progress: progressValue, timeSpent } = data;

      if (!lessonId || !isValidUUID(lessonId)) {
        return errorResponse('Valid lesson ID is required');
      }

      const studentId = user.studentId || user.id;
      const existing = progress.find(
        p => p.studentId === studentId && p.lessonId === lessonId
      );

      const now = new Date().toISOString();
      const progressData: StudentProgress = {
        id: existing?.id || crypto.randomUUID(),
        studentId,
        lessonId,
        completed: completed !== undefined ? completed : existing?.completed || false,
        progress: progressValue !== undefined ? progressValue : existing?.progress || 0,
        timeSpent: (existing?.timeSpent || 0) + (timeSpent || 0),
        lastAccessedAt: now,
        completedAt: completed ? (existing?.completedAt || now) : existing?.completedAt
      };

      if (existing) {
        updateById(progress, existing.id, progressData);
      } else {
        progress.push(progressData);
      }

      writeData('progress', progress);
      return jsonResponse({ progress: progressData });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Progress error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

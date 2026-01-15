import { Handler } from '@netlify/functions';
import { readData, writeData, findById } from './utils/storage';
import { getUserFromSession, extractToken, hasRole } from './utils/auth';
import { UserRole, Grade, AssignmentSubmission, QuizAttempt } from '../../types';
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
    const grades = readData<Grade>('grades');
    const submissions = readData<AssignmentSubmission>('submissions');
    const attempts = readData<QuizAttempt>('attempts');

    // GET - Get grades
    if (httpMethod === 'GET') {
      const studentId = user.studentId || user.id;

      // Students can only see their own grades
      if (user.role === UserRole.STUDENT) {
        const studentGrades = grades.filter(g => g.studentId === studentId);
        return jsonResponse({ grades: studentGrades });
      }

      // Teachers/Admins can see all grades or filter by student
      const queryParams = event.queryStringParameters || {};
      const filterStudentId = queryParams.studentId;

      if (filterStudentId) {
        const filteredGrades = grades.filter(g => g.studentId === filterStudentId);
        return jsonResponse({ grades: filteredGrades });
      }

      return jsonResponse({ grades });
    }

    // POST - Create grade from assignment or quiz
    if (httpMethod === 'POST') {
      if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { assignmentId, quizId, studentId, score, maxScore, feedback } = data;

      if (!studentId || score === undefined || maxScore === undefined) {
        return errorResponse('Student ID, score, and max score are required');
      }

      if (!assignmentId && !quizId) {
        return errorResponse('Either assignment ID or quiz ID is required');
      }

      // Check if grade already exists
      const existing = grades.find(
        g => g.studentId === studentId && 
        ((assignmentId && g.assignmentId === assignmentId) || (quizId && g.quizId === quizId))
      );

      if (existing) {
        return errorResponse('Grade already exists for this assignment/quiz', 400);
      }

      const percentage = (score / maxScore) * 100;
      const now = new Date().toISOString();

      const grade: Grade = {
        id: crypto.randomUUID(),
        studentId,
        assignmentId: assignmentId || undefined,
        quizId: quizId || undefined,
        score,
        maxScore,
        percentage,
        feedback: feedback || undefined,
        gradedBy: user.id,
        gradedAt: now,
        createdAt: now
      };

      grades.push(grade);
      writeData('grades', grades);

      return jsonResponse({ grade }, 201);
    }

    // PUT - Update grade
    if (httpMethod === 'PUT') {
      if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { id, score, maxScore, feedback } = data;

      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid grade ID is required');
      }

      const grade = findById(grades, id);
      if (!grade) {
        return errorResponse('Grade not found', 404);
      }

      const updatedScore = score !== undefined ? score : grade.score;
      const updatedMaxScore = maxScore !== undefined ? maxScore : grade.maxScore;
      const percentage = (updatedScore / updatedMaxScore) * 100;

      const updated = {
        ...grade,
        score: updatedScore,
        maxScore: updatedMaxScore,
        percentage,
        feedback: feedback !== undefined ? feedback : grade.feedback,
        gradedAt: new Date().toISOString()
      };

      const index = grades.findIndex(g => g.id === id);
      grades[index] = updated;
      writeData('grades', grades);

      return jsonResponse({ grade: updated });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Grades error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

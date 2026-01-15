import { Handler } from '@netlify/functions';
import { readData, writeData, findById, updateById, deleteById } from './utils/storage';
import { getUserFromSession, extractToken, hasRole } from './utils/auth';
import { UserRole, Quiz, QuizAttempt, QuizQuestion, QuestionType } from '../../types';
import { jsonResponse, errorResponse, handleOptions, isValidUUID } from './utils/validation';

function gradeQuiz(quiz: Quiz, answers: Record<string, string | string[]>): { score: number; isPassed: boolean } {
  let totalScore = 0;
  let maxScore = 0;

  quiz.questions.forEach(question => {
    maxScore += question.points;
    const userAnswer = answers[question.id];
    const correctAnswer = question.correctAnswer;

    if (Array.isArray(correctAnswer)) {
      // Multiple correct answers
      if (Array.isArray(userAnswer)) {
        const userSet = new Set(userAnswer);
        const correctSet = new Set(correctAnswer);
        const isCorrect = userSet.size === correctSet.size && 
          [...userSet].every(a => correctSet.has(a));
        if (isCorrect) totalScore += question.points;
      }
    } else {
      // Single correct answer
      if (userAnswer === correctAnswer) {
        totalScore += question.points;
      }
    }
  });

  const percentage = (totalScore / maxScore) * 100;
  const isPassed = quiz.passingScore ? percentage >= quiz.passingScore : percentage >= 60;

  return { score: totalScore, isPassed };
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

    const { httpMethod, body, path } = event;
    const quizzes = readData<Quiz>('quizzes');
    const attempts = readData<QuizAttempt>('attempts');

    // GET - List quizzes or get one
    if (httpMethod === 'GET') {
      const pathParts = path?.split('/').filter(Boolean);
      const lastPart = pathParts?.[pathParts.length - 1];

      // Get attempts for a quiz
      if (lastPart === 'attempts' && pathParts?.[pathParts.length - 2]) {
        const quizId = pathParts[pathParts.length - 2];
        const quizAttempts = attempts.filter(a => a.quizId === quizId);
        
        // Students can only see their own attempts
        if (user.role === UserRole.STUDENT) {
          const studentAttempts = quizAttempts.filter(a => a.studentId === user.studentId);
          return jsonResponse({ attempts: studentAttempts });
        }
        
        return jsonResponse({ attempts: quizAttempts });
      }

      // Get single quiz
      if (lastPart && lastPart !== 'quizzes' && isValidUUID(lastPart)) {
        const quiz = findById(quizzes, lastPart);
        if (!quiz) {
          return errorResponse('Quiz not found', 404);
        }
        
        // Don't show correct answers to students before submission
        if (user.role === UserRole.STUDENT) {
          const quizWithoutAnswers = {
            ...quiz,
            questions: quiz.questions.map(q => ({
              ...q,
              correctAnswer: undefined,
              explanation: undefined
            }))
          };
          return jsonResponse({ quiz: quizWithoutAnswers });
        }
        
        return jsonResponse({ quiz });
      }

      // List all quizzes
      return jsonResponse({ quizzes });
    }

    // POST - Create quiz or submit attempt
    if (httpMethod === 'POST') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const pathParts = path?.split('/').filter(Boolean);
      const lastPart = pathParts?.[pathParts.length - 1];

      // Submit quiz attempt (students)
      if (lastPart === 'submit') {
        if (user.role !== UserRole.STUDENT) {
          return errorResponse('Forbidden', 403);
        }

        const { quizId, answers, timeSpent } = data;
        if (!quizId || !answers) {
          return errorResponse('Quiz ID and answers are required');
        }

        const quiz = findById(quizzes, quizId);
        if (!quiz) {
          return errorResponse('Quiz not found', 404);
        }

        // Check max attempts
        if (quiz.maxAttempts) {
          const userAttempts = attempts.filter(
            a => a.quizId === quizId && a.studentId === user.studentId
          );
          if (userAttempts.length >= quiz.maxAttempts) {
            return errorResponse('Maximum attempts reached', 400);
          }
        }

        const { score, isPassed } = gradeQuiz(quiz, answers);

        const attempt: QuizAttempt = {
          id: crypto.randomUUID(),
          quizId,
          studentId: user.studentId!,
          answers,
          score,
          isPassed,
          startedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
          timeSpent: timeSpent || 0
        };

        attempts.push(attempt);
        writeData('attempts', attempts);

        return jsonResponse({ attempt }, 201);
      }

      // Create quiz (teacher/admin)
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      const { title, description, questions, timeLimit, maxAttempts, passingScore } = data;
      if (!title || !questions || !Array.isArray(questions)) {
        return errorResponse('Title and questions array are required');
      }

      const newQuiz: Quiz = {
        id: crypto.randomUUID(),
        title,
        description: description || '',
        questions: questions.map((q: any) => ({
          id: q.id || crypto.randomUUID(),
          type: q.type || QuestionType.MULTIPLE_CHOICE,
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          explanation: q.explanation
        })),
        timeLimit: timeLimit || undefined,
        maxAttempts: maxAttempts || undefined,
        passingScore: passingScore || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      quizzes.push(newQuiz);
      writeData('quizzes', quizzes);

      return jsonResponse({ quiz: newQuiz }, 201);
    }

    // PUT - Update quiz (teacher/admin)
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
        return errorResponse('Valid quiz ID is required');
      }

      updates.updatedAt = new Date().toISOString();
      const updated = updateById(quizzes, id, updates);
      if (!updated) {
        return errorResponse('Quiz not found', 404);
      }

      writeData('quizzes', quizzes);
      return jsonResponse({ quiz: updated });
    }

    // DELETE - Delete quiz (teacher/admin)
    if (httpMethod === 'DELETE') {
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      const id = path?.split('/').pop();
      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid quiz ID is required');
      }

      const deleted = deleteById(quizzes, id);
      if (!deleted) {
        return errorResponse('Quiz not found', 404);
      }

      // Also delete related attempts
      const filteredAttempts = attempts.filter(a => a.quizId !== id);
      writeData('attempts', filteredAttempts);
      writeData('quizzes', quizzes);

      return jsonResponse({ message: 'Quiz deleted successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

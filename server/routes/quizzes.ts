import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { readData, writeData, findById, updateById, deleteById } from '../utils/storage.js';
import { hasRole } from '../utils/auth.js';
import { UserRole, Quiz, QuizAttempt, QuestionType } from '../../types.js';
import { isValidUUID } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

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

// GET - List quizzes or get one
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await readData<Quiz>('quizzes');
    return res.json({ quizzes });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const quiz = await findById<Quiz>('quizzes', id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
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
      return res.json({ quiz: quizWithoutAnswers });
    }
    
    return res.json({ quiz });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id/attempts', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id: quizId } = req.params;
    const attempts = await readData<QuizAttempt>('attempts');
    const quizAttempts = attempts.filter(a => a.quizId === quizId);
    
    // Students can only see their own attempts
    if (user.role === UserRole.STUDENT) {
      const studentAttempts = quizAttempts.filter(a => a.studentId === user.studentId);
      return res.json({ attempts: studentAttempts });
    }
    
    return res.json({ attempts: quizAttempts });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST - Create quiz or submit attempt
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, description, questions, timeLimit, maxAttempts, passingScore } = req.body;
    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Title and questions array are required' });
    }

    const quizzes = await readData<Quiz>('quizzes');
    const newQuiz: Quiz = {
      id: randomUUID(),
      title,
      description: description || '',
      questions: questions.map((q: any) => ({
        id: q.id || randomUUID(),
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
    await writeData('quizzes', quizzes);

    return res.status(201).json({ quiz: newQuiz });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/submit', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (user.role !== UserRole.STUDENT) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { quizId, answers, timeSpent } = req.body;
    if (!quizId || !answers) {
      return res.status(400).json({ error: 'Quiz ID and answers are required' });
    }

    const quizzes = await readData<Quiz>('quizzes');
    const quiz = await findById<Quiz>('quizzes', quizId);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check max attempts
    if (quiz.maxAttempts) {
      const attempts = await readData<QuizAttempt>('attempts');
      const userAttempts = attempts.filter(
        a => a.quizId === quizId && a.studentId === user.studentId
      );
      if (userAttempts.length >= quiz.maxAttempts) {
        return res.status(400).json({ error: 'Maximum attempts reached' });
      }
    }

    const { score, isPassed } = gradeQuiz(quiz, answers);

    const attempts = await readData<QuizAttempt>('attempts');
    const attempt: QuizAttempt = {
      id: randomUUID(),
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
    await writeData('attempts', attempts);

    return res.status(201).json({ attempt });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT - Update quiz (teacher/admin)
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, ...updates } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid quiz ID is required' });
    }

    updates.updatedAt = new Date().toISOString();
    const updated = await updateById<Quiz>('quizzes', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    return res.json({ quiz: updated });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE - Delete quiz (teacher/admin)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!hasRole(user.role, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid quiz ID is required' });
    }

    const deleted = await deleteById('quizzes', id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Also delete related attempts
    const attempts = await readData<QuizAttempt>('attempts');
    const filteredAttempts = attempts.filter(a => a.quizId !== id);
    await writeData('attempts', filteredAttempts);

    return res.json({ message: 'Quiz deleted successfully' });
  } catch (error: any) {
    console.error('Quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

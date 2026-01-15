export enum PaymentPlan {
  FULL = 'FULL',
  HALF = 'HALF'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  SALES = 'SALES',
  TEACHER = 'TEACHER'
}

export enum InstallmentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING', // User uploaded proof, waiting for admin
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

export interface InstallmentData {
  status: InstallmentStatus;
  proofUrl?: string; // Base64 string of the screenshot
  paidAt?: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  studentId?: string; // If role is STUDENT
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  plan: PaymentPlan;
  installments: {
    inst1: InstallmentData;
    inst2: InstallmentData;
    inst3: InstallmentData;
  };
  userId?: string; // Link to login account
  createdAt: string;
}

// --- CLASSROOM TYPES ---
export interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  fileUrl: string; // Base64
  fileType: 'PDF' | 'IMAGE';
  createdAt: string;
}

// --- CRM TYPES ---
export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  NEGOTIATION = 'NEGOTIATION',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  source: string;
  notes: string;
  createdAt: string;
  lastContactedAt?: string;
}

export const COURSE_COST = 6000;
export const HALF_PAYMENT_INITIAL = 3000;
export const INSTALLMENT_VALUE = 1000;

// --- CLASSROOM TYPES ---

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // HTML or markdown content
  videoUrl?: string; // YouTube/Vimeo URL or uploaded video
  moduleId: string;
  order: number;
  duration?: number; // in minutes
  prerequisites?: string[]; // Array of lesson IDs
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  createdAt: string;
}

export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED'
}

export enum SubmissionStatus {
  NOT_STARTED = 'NOT_STARTED',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
  MISSING = 'MISSING'
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  fileUrl?: string; // Base64 or file path
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  feedback?: string;
  isLate: boolean;
  createdAt: string;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string | string[]; // Single or multiple correct answers
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  passingScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string | string[]>; // questionId -> answer(s)
  score?: number;
  isPassed?: boolean;
  startedAt: string;
  submittedAt?: string;
  timeSpent?: number; // in seconds
}

export interface StudentProgress {
  id: string;
  studentId: string;
  lessonId: string;
  completed: boolean;
  progress: number; // 0-100 percentage
  timeSpent: number; // in seconds
  lastAccessedAt: string;
  completedAt?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  assignmentId?: string;
  quizId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  gradedBy?: string; // Teacher/Admin ID
  gradedAt: string;
  createdAt: string;
}

export interface CourseProgress {
  studentId: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  totalAssignments: number;
  submittedAssignments: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageGrade?: number;
  lastActivityAt: string;
}

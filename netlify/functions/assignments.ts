import { Handler } from '@netlify/functions';
import { readData, writeData, findById, updateById, deleteById } from './utils/storage';
import { getUserFromSession, extractToken, hasRole } from './utils/auth';
import { UserRole, Assignment, AssignmentSubmission, AssignmentStatus, SubmissionStatus } from '../../types';
import { jsonResponse, errorResponse, handleOptions, isValidUUID, validateDate } from './utils/validation';

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
    const assignments = readData<Assignment>('assignments');
    const submissions = readData<AssignmentSubmission>('submissions');

    // GET - List assignments or get one
    if (httpMethod === 'GET') {
      const pathParts = path?.split('/').filter(Boolean);
      const lastPart = pathParts?.[pathParts.length - 1];
      
      // Get submissions for an assignment
      if (lastPart === 'submissions' && pathParts?.[pathParts.length - 2]) {
        const assignmentId = pathParts[pathParts.length - 2];
        const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
        
        // Students can only see their own submissions
        if (user.role === UserRole.STUDENT) {
          const studentSubmissions = assignmentSubmissions.filter(s => s.studentId === user.studentId);
          return jsonResponse({ submissions: studentSubmissions });
        }
        
        return jsonResponse({ submissions: assignmentSubmissions });
      }
      
      // Get single assignment
      if (lastPart && lastPart !== 'assignments' && isValidUUID(lastPart)) {
        const assignment = findById(assignments, lastPart);
        if (!assignment) {
          return errorResponse('Assignment not found', 404);
        }
        return jsonResponse({ assignment });
      }
      
      // List all assignments
      return jsonResponse({ assignments });
    }

    // POST - Create assignment or submit assignment
    if (httpMethod === 'POST') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const pathParts = path?.split('/').filter(Boolean);
      const lastPart = pathParts?.[pathParts.length - 1];

      // Submit assignment (students)
      if (lastPart === 'submit') {
        if (user.role !== UserRole.STUDENT) {
          return errorResponse('Forbidden', 403);
        }

        const { assignmentId, fileUrl } = data;
        if (!assignmentId || !fileUrl) {
          return errorResponse('Assignment ID and file URL are required');
        }

        const assignment = findById(assignments, assignmentId);
        if (!assignment) {
          return errorResponse('Assignment not found', 404);
        }

        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isLate = now > dueDate;

        const submission: AssignmentSubmission = {
          id: crypto.randomUUID(),
          assignmentId,
          studentId: user.studentId!,
          status: SubmissionStatus.SUBMITTED,
          fileUrl,
          submittedAt: now.toISOString(),
          isLate,
          createdAt: now.toISOString()
        };

        submissions.push(submission);
        writeData('submissions', submissions);

        return jsonResponse({ submission }, 201);
      }

      // Create assignment (teacher/admin)
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      const { title, description, dueDate, maxScore } = data;
      if (!title || !dueDate) {
        return errorResponse('Title and due date are required');
      }

      const dateError = validateDate(dueDate, 'Due date');
      if (dateError) {
        return errorResponse(dateError);
      }

      const newAssignment: Assignment = {
        id: crypto.randomUUID(),
        title,
        description: description || '',
        dueDate,
        status: AssignmentStatus.PUBLISHED,
        maxScore: maxScore || 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      assignments.push(newAssignment);
      writeData('assignments', assignments);

      return jsonResponse({ assignment: newAssignment }, 201);
    }

    // PUT - Update assignment or grade submission
    if (httpMethod === 'PUT') {
      if (!body) {
        return errorResponse('Request body is required');
      }

      const data = JSON.parse(body);
      const { id, submissionId, score, feedback } = data;

      // Grade submission (teacher/admin)
      if (submissionId) {
        if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
          return errorResponse('Forbidden', 403);
        }

        const submission = findById(submissions, submissionId);
        if (!submission) {
          return errorResponse('Submission not found', 404);
        }

        const updated = updateById(submissions, submissionId, {
          status: SubmissionStatus.GRADED,
          score,
          feedback,
          gradedAt: new Date().toISOString()
        });

        writeData('submissions', submissions);
        return jsonResponse({ submission: updated });
      }

      // Update assignment (teacher/admin)
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid assignment ID is required');
      }

      const updates = { ...data };
      delete updates.id;
      updates.updatedAt = new Date().toISOString();

      const updated = updateById(assignments, id, updates);
      if (!updated) {
        return errorResponse('Assignment not found', 404);
      }

      writeData('assignments', assignments);
      return jsonResponse({ assignment: updated });
    }

    // DELETE - Delete assignment (teacher/admin)
    if (httpMethod === 'DELETE') {
      if (!hasRole({ role: user.role } as any, UserRole.ADMIN) && user.role !== UserRole.TEACHER) {
        return errorResponse('Forbidden', 403);
      }

      const id = path?.split('/').pop();
      if (!id || !isValidUUID(id)) {
        return errorResponse('Valid assignment ID is required');
      }

      const deleted = deleteById(assignments, id);
      if (!deleted) {
        return errorResponse('Assignment not found', 404);
      }

      // Also delete related submissions
      const filteredSubmissions = submissions.filter(s => s.assignmentId !== id);
      writeData('submissions', filteredSubmissions);
      writeData('assignments', assignments);

      return jsonResponse({ message: 'Assignment deleted successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: any) {
    console.error('Assignments error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

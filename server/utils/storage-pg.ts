// PostgreSQL Storage Implementation
// Replaces file-based JSON storage with PostgreSQL database
import { randomUUID } from 'crypto';

// Lazy load pool to avoid initialization errors
let pool: any = null;
export async function getPool() {
  if (!pool) {
    const connection = await import('../db/connection.js');
    pool = connection.default;
  }
  return pool;
}

/**
 * Read all documents from a table
 */
export async function readData<T extends { id: string }>(tableName: string): Promise<T[]> {
  try {
    const dbPool = await getPool();
    const result = await dbPool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
    
    // Transform database rows to match the expected format
    return result.rows.map(row => transformRow<T>(tableName, row));
  } catch (error) {
    console.error(`Error reading ${tableName}:`, error);
    return [];
  }
}

/**
 * Find item by ID
 */
export async function findById<T extends { id: string }>(
  tableName: string,
  id: string
): Promise<T | null> {
  try {
    const dbPool = await getPool();
    const result = await dbPool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return transformRow<T>(tableName, result.rows[0]);
  } catch (error) {
    console.error(`Error finding ${tableName}/${id}:`, error);
    return null;
  }
}

/**
 * Create a new document
 */
export async function createById<T extends { id?: string }>(
  tableName: string,
  data: T
): Promise<T & { id: string }> {
  try {
    const id = data.id || randomUUID();
    const transformed = transformToDb(tableName, { ...data, id });
    
    const columns = Object.keys(transformed).join(', ');
    const values = Object.values(transformed);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const dbPool = await getPool();
    const result = await dbPool.query(query, values);
    
    return transformRow<T & { id: string }>(tableName, result.rows[0]);
  } catch (error) {
    console.error(`Error creating ${tableName}:`, error);
    throw error;
  }
}

/**
 * Update item by ID
 */
export async function updateById<T extends { id: string }>(
  tableName: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  try {
    const transformed = transformToDb(tableName, updates);
    const columns = Object.keys(transformed);
    
    if (columns.length === 0) {
      return await findById<T>(tableName, id);
    }
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const values = [...Object.values(transformed), id];
    
    const query = `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`;
    const dbPool = await getPool();
    const result = await dbPool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return transformRow<T>(tableName, result.rows[0]);
  } catch (error) {
    console.error(`Error updating ${tableName}/${id}:`, error);
    return null;
  }
}

/**
 * Delete item by ID
 */
export async function deleteById(
  tableName: string,
  id: string
): Promise<boolean> {
  try {
    const dbPool = await getPool();
    const result = await dbPool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error(`Error deleting ${tableName}/${id}:`, error);
    return false;
  }
}

/**
 * Write documents to a table (for bulk operations)
 * Note: This is kept for compatibility but PostgreSQL handles this differently
 */
export async function writeData<T extends { id: string }>(
  tableName: string,
  data: T[]
): Promise<void> {
  try {
    // For PostgreSQL, we'll use upsert (INSERT ... ON CONFLICT)
    // This is mainly for migration purposes
    if (data.length === 0) return;
    
    // Delete all existing records and insert new ones
    // This is a simple approach - in production, you'd want proper upsert logic
    const dbPool = await getPool();
    await dbPool.query(`DELETE FROM ${tableName}`);
    
    for (const item of data) {
      await createById(tableName, item);
    }
  } catch (error) {
    console.error(`Error writing ${tableName}:`, error);
    throw error;
  }
}

/**
 * Transform database row to application format
 */
function transformRow<T>(tableName: string, row: any): T {
  const transformed: any = { ...row };
  
  // Convert snake_case to camelCase
  if (row.user_id) transformed.userId = row.user_id;
  if (row.student_id) transformed.studentId = row.student_id;
  if (row.created_at) transformed.createdAt = row.created_at;
  if (row.updated_at) transformed.updatedAt = row.updated_at;
  if (row.expires_at) transformed.expiresAt = row.expires_at;
  if (row.last_contacted_at) transformed.lastContactedAt = row.last_contacted_at;
  if (row.due_date) transformed.dueDate = row.due_date;
  if (row.submitted_at) transformed.submittedAt = row.submitted_at;
  if (row.completed_at) transformed.completedAt = row.completed_at;
  if (row.last_accessed_at) transformed.lastAccessedAt = row.last_accessed_at;
  if (row.paid_at) transformed.paidAt = row.paid_at;
  if (row.video_url) transformed.videoUrl = row.video_url;
  if (row.file_url) transformed.fileUrl = row.file_url;
  if (row.file_type) transformed.fileType = row.file_type;
  if (row.module_id) transformed.moduleId = row.module_id;
  if (row.order_index) transformed.order = row.order_index;
  if (row.time_limit) transformed.timeLimit = row.time_limit;
  if (row.passing_score) transformed.passingScore = row.passing_score;
  if (row.time_spent) transformed.timeSpent = row.time_spent;
  if (row.progress_percentage) transformed.progress = row.progress_percentage;
  if (row.max_score) transformed.maxScore = row.max_score;
  if (row.assignment_id) transformed.assignmentId = row.assignment_id;
  if (row.quiz_id) transformed.quizId = row.quiz_id;
  if (row.proof_url) transformed.proofUrl = row.proof_url;
  if (row.installment_key) transformed.installmentKey = row.installment_key;
  
  // Remove snake_case fields
  delete transformed.user_id;
  delete transformed.student_id;
  delete transformed.created_at;
  delete transformed.updated_at;
  delete transformed.expires_at;
  delete transformed.last_contacted_at;
  delete transformed.due_date;
  delete transformed.submitted_at;
  delete transformed.completed_at;
  delete transformed.last_accessed_at;
  delete transformed.paid_at;
  delete transformed.video_url;
  delete transformed.file_url;
  delete transformed.file_type;
  delete transformed.module_id;
  delete transformed.order_index;
  delete transformed.time_limit;
  delete transformed.passing_score;
  delete transformed.time_spent;
  delete transformed.progress_percentage;
  delete transformed.max_score;
  delete transformed.assignment_id;
  delete transformed.quiz_id;
  delete transformed.proof_url;
  delete transformed.installment_key;
  
  return transformed as T;
}

/**
 * Validate UUID format
 */
function isValidUUID(value: any): boolean {
  if (!value || typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Transform application data to database format
 */
function transformToDb(tableName: string, data: any): any {
  const transformed: any = { ...data };
  
  // Convert camelCase to snake_case
  // Only include UUID fields if they have valid UUID values
  if (transformed.userId !== undefined) {
    if (isValidUUID(transformed.userId)) {
      transformed.user_id = transformed.userId;
    } else if (transformed.userId === null || transformed.userId === '') {
      // Allow null for optional UUID fields, but skip empty strings
      transformed.user_id = null;
    }
    delete transformed.userId;
  }
  if (transformed.studentId !== undefined) {
    if (isValidUUID(transformed.studentId)) {
      transformed.student_id = transformed.studentId;
    } else if (transformed.studentId === null || transformed.studentId === '') {
      // Allow null for optional UUID fields, but skip empty strings
      transformed.student_id = null;
    }
    delete transformed.studentId;
  }
  if (transformed.createdAt !== undefined) {
    transformed.created_at = transformed.createdAt;
    delete transformed.createdAt;
  }
  if (transformed.updatedAt !== undefined) {
    transformed.updated_at = transformed.updatedAt;
    delete transformed.updatedAt;
  }
  if (transformed.expiresAt !== undefined) {
    transformed.expires_at = transformed.expiresAt;
    delete transformed.expiresAt;
  }
  if (transformed.lastContactedAt !== undefined) {
    transformed.last_contacted_at = transformed.lastContactedAt;
    delete transformed.lastContactedAt;
  }
  if (transformed.dueDate !== undefined) {
    transformed.due_date = transformed.dueDate;
    delete transformed.dueDate;
  }
  if (transformed.submittedAt !== undefined) {
    transformed.submitted_at = transformed.submittedAt;
    delete transformed.submittedAt;
  }
  if (transformed.completedAt !== undefined) {
    transformed.completed_at = transformed.completedAt;
    delete transformed.completedAt;
  }
  if (transformed.lastAccessedAt !== undefined) {
    transformed.last_accessed_at = transformed.lastAccessedAt;
    delete transformed.lastAccessedAt;
  }
  if (transformed.paidAt !== undefined) {
    transformed.paid_at = transformed.paidAt;
    delete transformed.paidAt;
  }
  if (transformed.videoUrl !== undefined) {
    transformed.video_url = transformed.videoUrl;
    delete transformed.videoUrl;
  }
  if (transformed.fileUrl !== undefined) {
    transformed.file_url = transformed.fileUrl;
    delete transformed.fileUrl;
  }
  if (transformed.fileType !== undefined) {
    transformed.file_type = transformed.fileType;
    delete transformed.fileType;
  }
  if (transformed.moduleId !== undefined) {
    transformed.module_id = transformed.moduleId;
    delete transformed.moduleId;
  }
  if (transformed.order !== undefined) {
    transformed.order_index = transformed.order;
    delete transformed.order;
  }
  if (transformed.timeLimit !== undefined) {
    transformed.time_limit = transformed.timeLimit;
    delete transformed.timeLimit;
  }
  if (transformed.passingScore !== undefined) {
    transformed.passing_score = transformed.passingScore;
    delete transformed.passingScore;
  }
  if (transformed.timeSpent !== undefined) {
    transformed.time_spent = transformed.timeSpent;
    delete transformed.timeSpent;
  }
  if (transformed.progress !== undefined) {
    transformed.progress_percentage = transformed.progress;
    delete transformed.progress;
  }
  if (transformed.maxScore !== undefined) {
    transformed.max_score = transformed.maxScore;
    delete transformed.maxScore;
  }
  if (transformed.assignmentId !== undefined) {
    if (isValidUUID(transformed.assignmentId)) {
      transformed.assignment_id = transformed.assignmentId;
    } else if (transformed.assignmentId === null || transformed.assignmentId === '') {
      transformed.assignment_id = null;
    }
    delete transformed.assignmentId;
  }
  if (transformed.quizId !== undefined) {
    if (isValidUUID(transformed.quizId)) {
      transformed.quiz_id = transformed.quizId;
    } else if (transformed.quizId === null || transformed.quizId === '') {
      transformed.quiz_id = null;
    }
    delete transformed.quizId;
  }
  if (transformed.proofUrl !== undefined) {
    transformed.proof_url = transformed.proofUrl;
    delete transformed.proofUrl;
  }
  if (transformed.installmentKey !== undefined) {
    transformed.installment_key = transformed.installmentKey;
    delete transformed.installmentKey;
  }
  
  // Remove undefined values and invalid UUID empty strings
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === undefined) {
      delete transformed[key];
    }
    // Remove empty strings for UUID columns (they should be null instead)
    if ((key === 'user_id' || key === 'student_id' || key === 'assignment_id' || key === 'quiz_id') && transformed[key] === '') {
      delete transformed[key];
    }
  });
  
  return transformed;
}

/**
 * Special handling for students with installments
 */
export async function getStudentWithInstallments(studentId: string) {
  try {
    const dbPool = await getPool();
    const studentResult = await dbPool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    
    if (studentResult.rows.length === 0) {
      return null;
    }
    
    const student = studentResult.rows[0];
    const installmentsResult = await dbPool.query(
      'SELECT * FROM installments WHERE student_id = $1 ORDER BY installment_key',
      [studentId]
    );
    
    // Transform installments to nested object format
    const installments: any = {
      inst1: { status: 'UNPAID' },
      inst2: { status: 'UNPAID' },
      inst3: { status: 'UNPAID' },
    };
    
    installmentsResult.rows.forEach((row: any) => {
      installments[row.installment_key] = {
        status: row.status,
        proofUrl: row.proof_url,
        paidAt: row.paid_at,
      };
    });
    
    return {
      ...student,
      installments,
    };
  } catch (error) {
    console.error('Error getting student with installments:', error);
    return null;
  }
}

/**
 * Save student with installments
 */
export async function saveStudentWithInstallments(student: any) {
  try {
    const dbPool = await getPool();
    const client = await dbPool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Save or update student
      // Only include user_id if it's a valid UUID
      const studentData: any = {
        id: student.id,
        name: student.name,
        phone: student.phone,
        plan: student.plan,
      };
      
      // Only add user_id if it's a valid UUID
      if (student.userId && isValidUUID(student.userId)) {
        studentData.user_id = student.userId;
      } else if (student.userId === null || student.userId === undefined) {
        studentData.user_id = null;
      }
      
      const studentExists = await client.query('SELECT id FROM students WHERE id = $1', [student.id]);
      
      if (studentExists.rows.length > 0) {
        await client.query(
          'UPDATE students SET name = $1, phone = $2, plan = $3, user_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
          [studentData.name, studentData.phone, studentData.plan, studentData.user_id, studentData.id]
        );
      } else {
        await client.query(
          'INSERT INTO students (id, name, phone, plan, user_id) VALUES ($1, $2, $3, $4, $5)',
          [studentData.id, studentData.name, studentData.phone, studentData.plan, studentData.user_id]
        );
      }
      
      // Save installments
      if (student.installments) {
        for (const [key, inst] of Object.entries(student.installments)) {
          const instData = inst as any;
          await client.query(
            `INSERT INTO installments (student_id, installment_key, status, proof_url, paid_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (student_id, installment_key)
             DO UPDATE SET status = $3, proof_url = $4, paid_at = $5, updated_at = CURRENT_TIMESTAMP`,
            [student.id, key, instData.status, instData.proofUrl, instData.paidAt]
          );
        }
      }
      
      await client.query('COMMIT');
      
      return await getStudentWithInstallments(student.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving student with installments:', error);
    throw error;
  }
}

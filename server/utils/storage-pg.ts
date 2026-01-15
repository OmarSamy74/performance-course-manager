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
  
  // Handle special transformations based on table
  if (tableName === 'students') {
    // Students need installments as nested object
    return transformed as T; // Will be handled separately
  }
  
  // Convert snake_case to camelCase for JSON fields
  if (row.installment_key) {
    // This is an installment row
    return transformed as T;
  }
  
  return transformed as T;
}

/**
 * Transform application data to database format
 */
function transformToDb(tableName: string, data: any): any {
  const transformed: any = { ...data };
  
  // Remove undefined values
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === undefined) {
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
      const studentData = {
        id: student.id,
        name: student.name,
        phone: student.phone,
        plan: student.plan,
        user_id: student.userId,
      };
      
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

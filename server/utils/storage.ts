// Database Storage - Supports both PostgreSQL and File-based JSON storage
// Uses PostgreSQL if DATABASE_URL is set, otherwise falls back to file-based storage
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Check if PostgreSQL is available
const USE_POSTGRES = !!process.env.DATABASE_URL;

// Lazy load PostgreSQL storage
let pgStoragePromise: Promise<any> | null = null;
async function getPgStorage() {
  if (!USE_POSTGRES) return null;
  
  if (!pgStoragePromise) {
    pgStoragePromise = import('./storage-pg.js').catch((error) => {
      console.warn('⚠️  PostgreSQL import failed, falling back to file storage:', error);
      return null;
    });
  }
  
  return pgStoragePromise;
}

// Railway Primary Database Configuration
// Priority: 1) DATA_DIR env var, 2) Railway volume mount, 3) /data directory
const DATA_DIR = process.env.DATA_DIR || 
  (process.env.RAILWAY_VOLUME_MOUNT_PATH ? join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'data') : 
   join(process.cwd(), 'data'));

// Log database location on startup
console.log(`🗄️  Railway Primary Database: ${DATA_DIR}`);

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Initialize data directory on module load
ensureDataDir();

/**
 * Get file path for a collection
 */
function getFilePath(collectionName: string): string {
  return join(DATA_DIR, `${collectionName}.json`);
}

/**
 * Read all documents from a JSON file or PostgreSQL table
 */
export async function readData<T extends { id: string }>(collectionName: string): Promise<T[]> {
  // Use PostgreSQL if available
  const pgStorage = await getPgStorage();
  if (USE_POSTGRES && pgStorage) {
    // Map collection names to table names
    const tableMap: Record<string, string> = {
      'students': 'students',
      'users': 'users',
      'sessions': 'sessions',
      'leads': 'leads',
      'materials': 'materials',
      'lessons': 'lessons',
      'assignments': 'assignments',
      'submissions': 'submissions',
      'quizzes': 'quizzes',
      'attempts': 'quiz_attempts',
      'progress': 'progress',
      'grades': 'grades',
    };
    
    const tableName = tableMap[collectionName] || collectionName;
    
    // Special handling for students (need installments)
    if (collectionName === 'students') {
      const pgStorage = await getPgStorage();
      if (!pgStorage) return [];
      
      const { getPool } = pgStorage;
      const dbPool = await getPool();
      const result = await dbPool.query('SELECT id FROM students ORDER BY created_at DESC');
      const students: T[] = [];
      
      for (const row of result.rows) {
        const student = await pgStorage.getStudentWithInstallments(row.id);
        if (student) {
          students.push(student as T);
        }
      }
      
      return students;
    }
    
    return pgStorage.readData<T>(tableName);
  }
  
  // Fallback to file-based storage
  try {
    await ensureDataDir();
    const filePath = getFilePath(collectionName);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error: any) {
      // File doesn't exist, return empty array
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error reading ${collectionName}:`, error);
    return [];
  }
}

/**
 * Write documents to a JSON file or PostgreSQL table
 */
export async function writeData<T extends { id: string }>(collectionName: string, data: T[]): Promise<void> {
  // Use PostgreSQL if available
  const pgStorage = await getPgStorage();
  if (USE_POSTGRES && pgStorage) {
    const tableMap: Record<string, string> = {
      'students': 'students',
      'users': 'users',
      'sessions': 'sessions',
      'leads': 'leads',
      'materials': 'materials',
      'lessons': 'lessons',
      'assignments': 'assignments',
      'submissions': 'submissions',
      'quizzes': 'quizzes',
      'attempts': 'quiz_attempts',
      'progress': 'progress',
      'grades': 'grades',
    };
    
    const tableName = tableMap[collectionName] || collectionName;
    return await pgStorage.writeData<T>(tableName, data);
  }
  
  // Fallback to file-based storage
  try {
    await ensureDataDir();
    const filePath = getFilePath(collectionName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Find item by ID
 */
export async function findById<T extends { id: string }>(
  collectionName: string, 
  id: string
): Promise<T | null> {
  // Use PostgreSQL if available
  const pgStorage = await getPgStorage();
  if (USE_POSTGRES && pgStorage) {
    const tableMap: Record<string, string> = {
      'students': 'students',
      'users': 'users',
      'sessions': 'sessions',
      'leads': 'leads',
      'materials': 'materials',
      'lessons': 'lessons',
      'assignments': 'assignments',
      'submissions': 'submissions',
      'quizzes': 'quizzes',
      'attempts': 'quiz_attempts',
      'progress': 'progress',
      'grades': 'grades',
    };
    
    const tableName = tableMap[collectionName] || collectionName;
    
    // Special handling for students
    if (collectionName === 'students') {
      return await pgStorage.getStudentWithInstallments(id) as T | null;
    }
    
    return await pgStorage.findById<T>(tableName, id);
  }
  
  // Fallback to file-based storage
  try {
    const data = await readData<T>(collectionName);
    return data.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`Error finding ${collectionName}/${id}:`, error);
    return null;
  }
}

/**
 * Update item by ID
 */
export async function updateById<T extends { id: string }>(
  collectionName: string,
  id: string, 
  updates: Partial<T>
): Promise<T | null> {
  // Use PostgreSQL if available
  const pgStorage = await getPgStorage();
  if (USE_POSTGRES && pgStorage) {
    const tableMap: Record<string, string> = {
      'students': 'students',
      'users': 'users',
      'sessions': 'sessions',
      'leads': 'leads',
      'materials': 'materials',
      'lessons': 'lessons',
      'assignments': 'assignments',
      'submissions': 'submissions',
      'quizzes': 'quizzes',
      'attempts': 'quiz_attempts',
      'progress': 'progress',
      'grades': 'grades',
    };
    
    const tableName = tableMap[collectionName] || collectionName;
    
    // Special handling for students (need to save installments)
    if (collectionName === 'students' && (updates as any).installments) {
      const student = await findById<T>(collectionName, id);
      if (!student) return null;
      
      const updated = { ...student, ...updates };
      return await pgStorage.saveStudentWithInstallments(updated) as T | null;
    }
    
    return await pgStorage.updateById<T>(tableName, id, updates);
  }
  
  // Fallback to file-based storage
  try {
    const data = await readData<T>(collectionName);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    data[index] = { ...data[index], ...updates } as T;
    await writeData(collectionName, data);
    
    return data[index];
  } catch (error) {
    console.error(`Error updating ${collectionName}/${id}:`, error);
    return null;
  }
}

/**
 * Delete item by ID
 */
export async function deleteById(
  collectionName: string,
  id: string
): Promise<boolean> {
  // Use PostgreSQL if available
  const pgStorage = await getPgStorage();
  if (USE_POSTGRES && pgStorage) {
    const tableMap: Record<string, string> = {
      'students': 'students',
      'users': 'users',
      'sessions': 'sessions',
      'leads': 'leads',
      'materials': 'materials',
      'lessons': 'lessons',
      'assignments': 'assignments',
      'submissions': 'submissions',
      'quizzes': 'quizzes',
      'attempts': 'quiz_attempts',
      'progress': 'progress',
      'grades': 'grades',
    };
    
    const tableName = tableMap[collectionName] || collectionName;
    return await pgStorage.deleteById(tableName, id);
  }
  
  // Fallback to file-based storage
  try {
    const data = await readData<any>(collectionName);
    const filtered = data.filter((item: any) => item.id !== id);
    
    if (filtered.length === data.length) {
      return false; // Item not found
    }
    
    await writeData(collectionName, filtered);
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${id}:`, error);
    return false;
  }
}

/**
 * Create a new document
 */
export async function createById<T extends { id?: string }>(
  collectionName: string,
  data: T
): Promise<T & { id: string }> {
  // Use PostgreSQL if available
  const pgStorage = await getPgStorage();
  if (USE_POSTGRES && pgStorage) {
    const tableMap: Record<string, string> = {
      'students': 'students',
      'users': 'users',
      'sessions': 'sessions',
      'leads': 'leads',
      'materials': 'materials',
      'lessons': 'lessons',
      'assignments': 'assignments',
      'submissions': 'submissions',
      'quizzes': 'quizzes',
      'attempts': 'quiz_attempts',
      'progress': 'progress',
      'grades': 'grades',
    };
    
    const tableName = tableMap[collectionName] || collectionName;
    
    // Special handling for students (need to save installments)
    if (collectionName === 'students' && (data as any).installments) {
      return await pgStorage.saveStudentWithInstallments(data) as T & { id: string };
    }
    
    return await pgStorage.createById<T>(tableName, data);
  }
  
  // Fallback to file-based storage
  try {
    const collection = await readData<T & { id: string }>(collectionName);
    const newItem: T & { id: string } = {
      ...data,
      id: data.id || randomUUID()
    } as T & { id: string };
    
    collection.push(newItem);
    await writeData(collectionName, collection);
    
    return newItem;
  } catch (error) {
    console.error(`Error creating ${collectionName}:`, error);
    throw error;
  }
}

// File-based JSON storage for Railway
import { promises as fs } from 'fs';
import { join } from 'path';

// Use Railway volume if available, otherwise local data directory
const DATA_DIR = process.env.DATA_DIR || (process.env.RAILWAY_VOLUME_MOUNT_PATH ? join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'data') : join(process.cwd(), 'data'));

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
 * Read all documents from a JSON file
 */
export async function readData<T extends { id: string }>(collectionName: string): Promise<T[]> {
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
 * Write documents to a JSON file
 */
export async function writeData<T extends { id: string }>(collectionName: string, data: T[]): Promise<void> {
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
  try {
    const collection = await readData<T & { id: string }>(collectionName);
    const newItem: T & { id: string } = {
      ...data,
      id: data.id || crypto.randomUUID()
    } as T & { id: string };
    
    collection.push(newItem);
    await writeData(collectionName, collection);
    
    return newItem;
  } catch (error) {
    console.error(`Error creating ${collectionName}:`, error);
    throw error;
  }
}

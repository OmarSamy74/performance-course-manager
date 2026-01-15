import * as fs from 'fs';
import * as path from 'path';

// Get data directory - works in both local and Netlify environment
function getDataDir() {
  // In Netlify Functions, __dirname points to the function directory
  // In local dev, it's relative to the function file
  const baseDir = __dirname.includes('/.netlify') 
    ? path.join(process.cwd(), 'netlify/functions/data')
    : path.join(__dirname, '../data');
  return baseDir;
}

const DATA_DIR = getDataDir();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read JSON data from file
 */
export function readData<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  if (!fs.existsSync(filePath)) {
    // Create empty file if it doesn't exist
    writeData(filename, []);
    return [];
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

/**
 * Write JSON data to file (atomic operation)
 */
export function writeData<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  const tempPath = `${filePath}.tmp`;
  
  try {
    // Write to temp file first
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    // Atomic move
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

/**
 * Find item by ID
 */
export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

/**
 * Update item by ID
 */
export function updateById<T extends { id: string }>(items: T[], id: string, updates: Partial<T>): T | null {
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates };
  return items[index];
}

/**
 * Delete item by ID
 */
export function deleteById<T extends { id: string }>(items: T[], id: string): boolean {
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  items.splice(index, 1);
  return true;
}

/**
 * Create backup of data file
 */
export function backupData(filename: string): void {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  const backupPath = path.join(DATA_DIR, `${filename}.backup.json`);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.copyFileSync(filePath, backupPath);
    } catch (error) {
      console.error(`Error backing up ${filename}:`, error);
    }
  }
}

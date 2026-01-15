#!/usr/bin/env tsx
/**
 * Database Initialization Script
 * 
 * This script initializes the file-based JSON database by:
 * 1. Creating the /data directory
 * 2. Creating empty JSON files for all collections
 * 3. Seeding initial data (admin, teachers, etc.)
 * 
 * Usage:
 *   npm run init-db        # Initialize database
 *   npm run init-db -- --seed  # Initialize with seed data
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { UserRole } from '../types.js';

// Data directory path (same as storage.ts)
const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');

// All collections that need to be initialized
const COLLECTIONS = [
  'users',
  'sessions',
  'students',
  'leads',
  'materials',
  'lessons',
  'assignments',
  'submissions',
  'quizzes',
  'attempts',
  'progress',
  'grades',
] as const;

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`✅ Data directory created: ${DATA_DIR}`);
  } catch (error) {
    console.error('❌ Error creating data directory:', error);
    throw error;
  }
}

/**
 * Initialize empty JSON file for a collection
 */
async function initCollection(collectionName: string): Promise<void> {
  const filePath = join(DATA_DIR, `${collectionName}.json`);
  
  try {
    // Check if file already exists
    try {
      await fs.access(filePath);
      console.log(`⏭️  ${collectionName}.json already exists, skipping...`);
      return;
    } catch {
      // File doesn't exist, create it
    }
    
    // Create empty array
    await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
    console.log(`✅ Created ${collectionName}.json`);
  } catch (error) {
    console.error(`❌ Error creating ${collectionName}.json:`, error);
    throw error;
  }
}

/**
 * Seed initial user data
 */
async function seedInitialUsers(): Promise<void> {
  const filePath = join(DATA_DIR, 'users.json');
  
  const initialUsers = [
    {
      id: 'admin',
      username: 'Administrator',
      role: UserRole.ADMIN,
    },
    {
      id: 'teacher',
      username: 'أ. المحاضر',
      role: UserRole.TEACHER,
    },
    {
      id: 'sales1',
      username: 'Sales Agent',
      role: UserRole.SALES,
    },
    {
      id: 'omar.samy',
      username: 'Omar Samy',
      role: UserRole.TEACHER,
    },
    {
      id: 'abdelatif.reda',
      username: 'Abdelatif Reda',
      role: UserRole.TEACHER,
    },
    {
      id: 'karim.ali',
      username: 'Karim Ali',
      role: UserRole.TEACHER,
    },
  ];
  
  try {
    await fs.writeFile(filePath, JSON.stringify(initialUsers, null, 2), 'utf-8');
    console.log(`✅ Seeded ${initialUsers.length} initial users`);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

/**
 * Main initialization function
 */
async function main() {
  const shouldSeed = process.argv.includes('--seed');
  
  console.log('🚀 Initializing database...\n');
  console.log(`📁 Data directory: ${DATA_DIR}\n`);
  
  try {
    // 1. Create data directory
    await ensureDataDir();
    console.log('');
    
    // 2. Initialize all collections
    console.log('📝 Creating collection files...');
    for (const collection of COLLECTIONS) {
      await initCollection(collection);
    }
    console.log('');
    
    // 3. Seed initial data if requested
    if (shouldSeed) {
      console.log('🌱 Seeding initial data...');
      await seedInitialUsers();
      console.log('');
    }
    
    console.log('✨ Database initialization complete!');
    console.log(`\n📊 Collections initialized: ${COLLECTIONS.length}`);
    if (shouldSeed) {
      console.log('🌱 Initial users seeded');
    }
    console.log(`\n💡 Tip: Use 'npm run init-db -- --seed' to seed initial data`);
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as initDatabase };

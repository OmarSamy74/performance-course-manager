#!/usr/bin/env tsx
/**
 * Reset users from USER_PASSWORDS.md file
 * Reads passwords from docs/USER_PASSWORDS.md and creates/updates users
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run reset-users:from-md
 *   Or set RESET_USERS_ON_DEPLOY=true for automatic reset on deploy
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { UserRole } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface UserPassword {
  username: string;
  password: string;
  role: UserRole;
  courseId?: string;
  displayName?: string;
}

function parsePasswordsFromMD(): UserPassword[] {
  const mdPath = join(__dirname, '..', 'docs', 'USER_PASSWORDS.md');
  
  try {
    const content = readFileSync(mdPath, 'utf-8');
    const users: UserPassword[] = [];
    
    // Parse markdown format
    const sections = content.split(/### |## /);
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      // Extract username
      const usernameMatch = section.match(/\*\*Username\*\*:\s*`([^`]+)`/);
      if (!usernameMatch) continue;
      const username = usernameMatch[1];
      
      // Extract password
      const passwordMatch = section.match(/\*\*Password\*\*:\s*`([^`]+)`/);
      if (!passwordMatch) continue;
      const password = passwordMatch[1];
      
      // Extract role
      const roleMatch = section.match(/\*\*Role\*\*:\s*(\w+)/);
      if (!roleMatch) continue;
      const role = roleMatch[1] as UserRole;
      
      // Extract course (optional)
      const courseMatch = section.match(/\*\*Course\*\*:\s*([^\n]+)/);
      const courseId = courseMatch ? courseMatch[1].trim() : undefined;
      
      // Extract display name (from section title)
      const titleMatch = section.match(/^([^\n]+)/);
      const displayName = titleMatch ? titleMatch[1].trim() : username;
      
      users.push({
        username,
        password,
        role,
        courseId,
        displayName
      });
    }
    
    return users;
  } catch (error: any) {
    console.error('❌ Error reading USER_PASSWORDS.md:', error.message);
    console.error('\n💡 Make sure docs/USER_PASSWORDS.md exists and is properly formatted');
    process.exit(1);
  }
}

async function resetUsersFromMD() {
  // Only run if explicitly enabled
  if (process.env.RESET_USERS_ON_DEPLOY !== 'true' && !process.env.DATABASE_URL) {
    console.log('ℹ️  User reset skipped (RESET_USERS_ON_DEPLOY not set to true)');
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('\n💡 Usage:');
    console.log('   DATABASE_URL="postgresql://..." npm run reset-users:from-md');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('🔐 Resetting users from USER_PASSWORDS.md...');
    console.log('   Host: ' + new URL(databaseUrl).hostname);
    console.log('');
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to database\n');
    
    // Parse passwords from MD file
    console.log('📖 Reading passwords from docs/USER_PASSWORDS.md...');
    const usersToCreate = parsePasswordsFromMD();
    
    if (usersToCreate.length === 0) {
      console.error('❌ No users found in USER_PASSWORDS.md');
      console.error('   Please check the file format');
      process.exit(1);
    }
    
    console.log(`✅ Found ${usersToCreate.length} user(s) to create\n`);
    
    // Delete all existing users
    console.log('🗑️  Deleting all existing users...');
    const deleteResult = await pool.query('DELETE FROM users');
    console.log(`✅ Deleted ${deleteResult.rowCount} user(s)\n`);
    
    // Create new users with passwords from MD file
    console.log('👥 Creating users with passwords from MD file...\n');
    
    for (const userData of usersToCreate) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userId = randomUUID();
      
      await pool.query(
        `INSERT INTO users (id, username, password, role, course_id, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          userId,
          userData.username,
          hashedPassword,
          userData.role,
          userData.courseId || null
        ]
      );
      
      console.log(`✅ Created: ${userData.username} (${userData.role})`);
    }
    
    // Display all passwords
    console.log('\n' + '='.repeat(70));
    console.log('📋 USER PASSWORDS (from USER_PASSWORDS.md):');
    console.log('='.repeat(70));
    for (const user of usersToCreate) {
      const displayName = user.displayName || user.username;
      console.log(`${user.username.padEnd(20)} (${displayName.padEnd(25)}) : ${user.password}`);
    }
    console.log('='.repeat(70));
    console.log('\n✅ Users reset successfully!\n');
    
    await pool.end();
    
    // Don't exit if called as module
    if (import.meta.url === `file://${process.argv[1]}`) {
      process.exit(0);
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('   Details:', error);
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore
    }
    
    // Don't exit if called as module (non-blocking)
    if (import.meta.url === `file://${process.argv[1]}`) {
      process.exit(1);
    }
  }
}

// Only run if called directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  resetUsersFromMD();
}

// Export for use as module
export { resetUsersFromMD };

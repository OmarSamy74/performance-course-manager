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
  displayName?: string;
}

function parsePasswordsFromMD(): UserPassword[] {
  const mdPath = join(__dirname, '..', 'docs', 'USER_PASSWORDS.md');
  
  try {
    const content = readFileSync(mdPath, 'utf-8');
    const users: UserPassword[] = [];
    
    // Parse markdown format - split by sections
    const sections = content.split(/### |## /);
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      // Extract username
      const usernameMatch = section.match(/\*\*Username\*\*:\s*`([^`]+)`/);
      if (!usernameMatch) continue;
      const username = usernameMatch[1].trim();
      
      // Extract password
      const passwordMatch = section.match(/\*\*Password\*\*:\s*`([^`]+)`/);
      if (!passwordMatch) continue;
      const password = passwordMatch[1].trim();
      
      // Extract role - look for "Role: ADMIN" or "Role: `ADMIN`" or "Role: ADMIN"
      let roleMatch = section.match(/\*\*Role\*\*:\s*`?([A-Z]+)`?/);
      if (!roleMatch) {
        // Try without markdown formatting
        roleMatch = section.match(/Role:\s*([A-Z]+)/);
      }
      if (!roleMatch) continue;
      
      let role = roleMatch[1].toUpperCase().trim() as UserRole;
      
      // Validate role
      if (!['ADMIN', 'STUDENT', 'SALES', 'TEACHER'].includes(role)) {
        console.warn(`⚠️  Invalid role "${role}" for user ${username}, skipping`);
        continue;
      }
      
      // Extract display name (from section title - first line)
      const titleMatch = section.match(/^([^\n]+)/);
      const displayName = titleMatch ? titleMatch[1].trim() : username;
      
      users.push({
        username,
        password,
        role,
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
  // Only run if explicitly enabled OR if DATABASE_URL is set (manual run)
  const isDeploy = process.env.RESET_USERS_ON_DEPLOY === 'true';
  const isManual = !!process.env.DATABASE_URL;
  
  if (!isDeploy && !isManual) {
    // Silent skip if not enabled (normal case)
    return;
  }
  
  if (isDeploy) {
    console.log('🔐 [Deploy] RESET_USERS_ON_DEPLOY=true detected');
    console.log('🔐 [Deploy] Starting user reset from USER_PASSWORDS.md...');
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
    if (isDeploy) {
      console.log('🔐 [Deploy] Resetting users from USER_PASSWORDS.md...');
    } else {
      console.log('🔐 Resetting users from USER_PASSWORDS.md...');
      console.log('   Host: ' + new URL(databaseUrl).hostname);
    }
    console.log('');
    
    // Test connection
    await pool.query('SELECT 1');
    if (isDeploy) {
      console.log('✅ [Deploy] Connected to database\n');
    } else {
      console.log('✅ Connected to database\n');
    }
    
    // Parse passwords from MD file
    if (isDeploy) {
      console.log('📖 [Deploy] Reading passwords from docs/USER_PASSWORDS.md...');
    } else {
      console.log('📖 Reading passwords from docs/USER_PASSWORDS.md...');
    }
    const usersToCreate = parsePasswordsFromMD();
    
    if (usersToCreate.length === 0) {
      console.error('❌ No users found in USER_PASSWORDS.md');
      console.error('   Please check the file format');
      if (isDeploy) {
        console.error('⚠️  [Deploy] Continuing deployment despite error');
        return; // Don't exit, just return
      }
      process.exit(1);
    }
    
    if (isDeploy) {
      console.log(`✅ [Deploy] Found ${usersToCreate.length} user(s) to create\n`);
    } else {
      console.log(`✅ Found ${usersToCreate.length} user(s) to create\n`);
    }
    
    // Delete all existing users
    if (isDeploy) {
      console.log('🗑️  [Deploy] Deleting all existing users...');
    } else {
      console.log('🗑️  Deleting all existing users...');
    }
    const deleteResult = await pool.query('DELETE FROM users');
    if (isDeploy) {
      console.log(`✅ [Deploy] Deleted ${deleteResult.rowCount} user(s)\n`);
    } else {
      console.log(`✅ Deleted ${deleteResult.rowCount} user(s)\n`);
    }
    
    // Create new users with passwords from MD file
    if (isDeploy) {
      console.log('👥 [Deploy] Creating users with passwords from MD file...\n');
    } else {
      console.log('👥 Creating users with passwords from MD file...\n');
    }
    
    for (const userData of usersToCreate) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userId = randomUUID();
      
      // Insert without course_id (removed as requested)
      await pool.query(
        `INSERT INTO users (id, username, password, role, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          userId,
          userData.username,
          hashedPassword,
          userData.role
        ]
      );
      
      if (isDeploy) {
        console.log(`✅ [Deploy] Created: ${userData.username} (${userData.role})`);
      } else {
        console.log(`✅ Created: ${userData.username} (${userData.role})`);
      }
    }
    
    // Display all passwords
    console.log('\n' + '='.repeat(70));
    if (isDeploy) {
      console.log('📋 [Deploy] USER PASSWORDS (from USER_PASSWORDS.md):');
    } else {
      console.log('📋 USER PASSWORDS (from USER_PASSWORDS.md):');
    }
    console.log('='.repeat(70));
    for (const user of usersToCreate) {
      const displayName = user.displayName || user.username;
      console.log(`${user.username.padEnd(20)} (${displayName.padEnd(25)}) : ${user.password}`);
    }
    console.log('='.repeat(70));
    if (isDeploy) {
      console.log('\n✅ [Deploy] Users reset successfully!');
      console.log('⚠️  [Deploy] IMPORTANT: Save these passwords from Railway logs!\n');
    } else {
      console.log('\n✅ Users reset successfully!\n');
    }
    
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

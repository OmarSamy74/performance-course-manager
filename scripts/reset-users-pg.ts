#!/usr/bin/env tsx
/**
 * Reset all users - Delete all and create new users with fresh passwords
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run reset-users:pg
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UserRole } from '../types.js';

// Generate complex password (12 characters)
function generateComplexPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = password.length; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function resetUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('\n💡 Usage:');
    console.log('   DATABASE_URL="postgresql://..." npm run reset-users:pg');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('🔐 Resetting all users...');
    console.log('   Host: ' + new URL(databaseUrl).hostname);
    console.log('');
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to database\n');
    
    // Delete all users
    console.log('🗑️  Deleting all existing users...');
    const deleteResult = await pool.query('DELETE FROM users');
    console.log(`✅ Deleted ${deleteResult.rowCount} user(s)\n`);
    
    // Create new users
    console.log('👥 Creating new users...\n');
    
    const usersToCreate = [
      { username: 'admin', role: UserRole.ADMIN, displayName: 'Administrator' },
      { username: 'omar.samy', role: UserRole.TEACHER, displayName: 'Omar Samy', courseId: 'soccer-analytics-pro-performance-mastery' },
      { username: 'abdelatif.reda', role: UserRole.TEACHER, displayName: 'Abdelatif Reda', courseId: 'soccer-analytics-pro-performance-mastery' },
      { username: 'karim.ali', role: UserRole.TEACHER, displayName: 'Karim Ali', courseId: 'soccer-analytics-pro-performance-mastery' },
      { username: 'teacher', role: UserRole.TEACHER, displayName: 'أ. المحاضر', courseId: 'soccer-analytics-pro-performance-mastery' },
      { username: 'sales', role: UserRole.SALES, displayName: 'Sales Agent' },
    ];
    
    const passwordMap: Record<string, string> = {};
    
    for (const userData of usersToCreate) {
      const password = generateComplexPassword();
      const hashedPassword = await bcrypt.hash(password, 10);
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
      
      passwordMap[userData.username] = password;
      console.log(`✅ Created: ${userData.username} (${userData.role})`);
    }
    
    // Display all passwords
    console.log('\n' + '='.repeat(70));
    console.log('📋 NEW USER PASSWORDS (SAVE THESE SECURELY!):');
    console.log('='.repeat(70));
    for (const [username, password] of Object.entries(passwordMap)) {
      const userInfo = usersToCreate.find(u => u.username === username);
      const displayName = userInfo?.displayName || username;
      console.log(`${username.padEnd(20)} (${displayName.padEnd(25)}) : ${password}`);
    }
    console.log('='.repeat(70));
    console.log('\n⚠️  IMPORTANT: Save these passwords immediately!');
    console.log('   They cannot be recovered if lost.\n');
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 Connection timeout. Check:');
      console.error('   - Internet connection');
      console.error('   - DATABASE_URL is correct');
      console.error('   - Railway PostgreSQL is running');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection failed. Check:');
      console.error('   - DATABASE_URL hostname is correct');
      console.error('   - Use PUBLIC DATABASE_URL (not .railway.internal)');
    } else {
      console.error('\n💡 Error details:', error.code || 'Unknown error');
    }
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore
    }
    process.exit(1);
  }
}

resetUsers();

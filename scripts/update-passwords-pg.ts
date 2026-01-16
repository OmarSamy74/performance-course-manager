#!/usr/bin/env tsx
/**
 * Update all user passwords in PostgreSQL database
 * 
 * Generates new complex passwords for all users and updates them in the database
 * 
 * Usage:
 *   npm run update-passwords:pg
 *   # Or with DATABASE_URL:
 *   DATABASE_URL="postgresql://..." npm run update-passwords:pg
 */

import pool, { initDatabase } from '../server/db/connection.js';
import bcrypt from 'bcryptjs';

// Generate complex password (12 characters: uppercase, lowercase, numbers, symbols)
function generateComplexPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function updatePasswords() {
  try {
    console.log('🔐 Connecting to database...');
    
    // Initialize database connection
    await initDatabase();
    
    // Get all users
    const usersResult = await pool.query('SELECT id, username, role FROM users ORDER BY username');
    const users = usersResult.rows;
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      return;
    }
    
    console.log(`\n📋 Found ${users.length} user(s) to update\n`);
    
    const passwordMap: Record<string, string> = {};
    
    // Update each user's password
    for (const user of users) {
      const newPassword = generateComplexPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
      
      passwordMap[user.username] = newPassword;
      
      console.log(`✅ Updated password for: ${user.username} (${user.role})`);
    }
    
    // Display all passwords
    console.log('\n' + '='.repeat(60));
    console.log('📋 Updated Passwords (SAVE THESE SECURELY):');
    console.log('='.repeat(60));
    for (const [username, password] of Object.entries(passwordMap)) {
      console.log(`${username}: ${password}`);
    }
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT: Save these passwords securely!');
    console.log('   They cannot be recovered if lost.\n');
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error updating passwords:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

updatePasswords();

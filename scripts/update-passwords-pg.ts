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

import { Pool } from 'pg';
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
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('\n💡 To get DATABASE_URL:');
    console.log('   1. Go to Railway Dashboard');
    console.log('   2. Select your PostgreSQL service');
    console.log('   3. Go to Variables tab');
    console.log('   4. Copy DATABASE_URL value');
    console.log('\n   Then run:');
    console.log('   DATABASE_URL="your-url" npm run update-passwords:pg');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }, // Always use SSL for Railway
    connectionTimeoutMillis: 10000, // 10 second timeout
    query_timeout: 30000, // 30 second query timeout
  });

  try {
    console.log('🔐 Connecting to database...');
    console.log(`   Host: ${new URL(databaseUrl).hostname}`);
    
    // Test connection with timeout
    const connectPromise = pool.query('SELECT 1');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Connected to database');
    
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
    console.error('\n❌ Error updating passwords:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 Connection timeout. Possible issues:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify DATABASE_URL is correct');
      console.error('   3. Check if Railway PostgreSQL is running');
      console.error('   4. Try again in a few moments');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection failed. Possible issues:');
      console.error('   1. DATABASE_URL hostname is incorrect');
      console.error('   2. PostgreSQL service is not accessible');
      console.error('   3. Firewall blocking connection');
      console.error('   4. Use PUBLIC DATABASE_URL (not .railway.internal)');
    } else {
      console.error('\n💡 Error details:', error.code || 'Unknown error');
    }
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore errors when closing
    }
    process.exit(1);
  }
}

updatePasswords();

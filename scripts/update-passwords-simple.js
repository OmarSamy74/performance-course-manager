#!/usr/bin/env node
/**
 * Simple Node.js script to update passwords (no TypeScript)
 * 
 * Usage:
 *   DATABASE_URL="..." node scripts/update-passwords-simple.js
 */

import pg from 'pg';
const { Pool } = pg;
import bcrypt from 'bcryptjs';

// Generate complex password (12 characters)
function generateComplexPassword() {
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

async function updatePasswords() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('\n💡 Usage:');
    console.log('   DATABASE_URL="postgresql://..." node scripts/update-passwords-simple.js');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('🔐 Connecting to database...');
    const hostname = new URL(databaseUrl).hostname;
    console.log(`   Host: ${hostname}`);
    
    // Test connection
    await Promise.race([
      pool.query('SELECT 1'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 15000)
      )
    ]);
    
    console.log('✅ Connected to database\n');
    
    // Get all users
    console.log('📋 Fetching users...');
    const usersResult = await pool.query('SELECT id, username, role FROM users ORDER BY username');
    const users = usersResult.rows;
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      await pool.end();
      process.exit(0);
    }
    
    console.log(`✅ Found ${users.length} user(s)\n`);
    
    const passwordMap = {};
    
    // Update each user's password
    console.log('🔄 Updating passwords...\n');
    for (const user of users) {
      const newPassword = generateComplexPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
      
      passwordMap[user.username] = newPassword;
      
      console.log(`✅ ${user.username} (${user.role})`);
    }
    
    // Display all passwords
    console.log('\n' + '='.repeat(60));
    console.log('📋 UPDATED PASSWORDS (SAVE THESE SECURELY!):');
    console.log('='.repeat(60));
    for (const [username, password] of Object.entries(passwordMap)) {
      console.log(`${username}: ${password}`);
    }
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT: Save these passwords immediately!');
    console.log('   They cannot be recovered if lost.\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 Connection timeout. Check:');
      console.error('   - Internet connection');
      console.error('   - DATABASE_URL is correct');
      console.error('   - Railway PostgreSQL is running');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection failed. Check:');
      console.error('   - DATABASE_URL hostname is correct');
      console.error('   - Use PUBLIC URL (not .railway.internal)');
      console.error('   - PostgreSQL service is accessible');
    }
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore
    }
    process.exit(1);
  }
}

updatePasswords();

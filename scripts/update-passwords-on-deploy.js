#!/usr/bin/env node
/**
 * Update passwords on Railway deploy
 * This script runs automatically during deployment if UPDATE_PASSWORDS_ON_DEPLOY=true
 * 
 * Usage:
 *   UPDATE_PASSWORDS_ON_DEPLOY=true npm run deploy:update-passwords
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

async function updatePasswordsOnDeploy() {
  // Only run if explicitly enabled
  if (process.env.UPDATE_PASSWORDS_ON_DEPLOY !== 'true') {
    // Don't log if not enabled (normal case)
    return;
  }
  
  console.log('🔐 [Deploy] Starting password update...');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000, // 30 seconds for deploy
  });

  try {
    console.log('🔐 [Deploy] Connecting to database...');
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ [Deploy] Connected to database');
    console.log('🔐 [Deploy] Updating user passwords...');
    
    // Get all users
    const usersResult = await pool.query('SELECT id, username, role FROM users ORDER BY username');
    const users = usersResult.rows;
    
    if (users.length === 0) {
      console.log('⚠️  [Deploy] No users found');
      await pool.end();
      process.exit(0);
    }
    
    console.log(`📋 [Deploy] Found ${users.length} user(s)`);
    
    const passwordMap = {};
    
    // Update each user's password
    for (const user of users) {
      const newPassword = generateComplexPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
      
      passwordMap[user.username] = newPassword;
      console.log(`✅ [Deploy] Updated: ${user.username}`);
    }
    
    // Log passwords (will be visible in Railway logs)
    console.log('\n' + '='.repeat(60));
    console.log('📋 [Deploy] NEW PASSWORDS (SAVE FROM RAILWAY LOGS):');
    console.log('='.repeat(60));
    for (const [username, password] of Object.entries(passwordMap)) {
      console.log(`${username}: ${password}`);
    }
    console.log('='.repeat(60));
    console.log('⚠️  [Deploy] IMPORTANT: Copy these passwords from Railway logs!');
    console.log('   They cannot be recovered if lost.\n');
    
    await pool.end();
    console.log('✅ [Deploy] Password update completed successfully');
    // Don't exit if called as module
    if (import.meta.url === `file://${process.argv[1]}`) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ [Deploy] Error updating passwords:', error.message);
    // Don't fail deployment if password update fails
    console.log('⚠️  [Deploy] Continuing deployment despite password update error');
    try {
      await pool.end();
    } catch (e) {
      // Ignore
    }
    // Don't exit if called as module
    if (import.meta.url === `file://${process.argv[1]}`) {
      process.exit(0);
    }
  }
}

// Only run if called directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  updatePasswordsOnDeploy();
}

// Export for use as module
export { updatePasswordsOnDeploy };

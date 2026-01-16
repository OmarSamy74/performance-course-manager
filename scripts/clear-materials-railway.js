#!/usr/bin/env node
/**
 * Clear all materials from PostgreSQL database using Railway connection
 * 
 * Usage:
 *   node scripts/clear-materials-railway.js
 * 
 * Requires DATABASE_URL environment variable
 */

import pg from 'pg';
const { Pool } = pg;

async function clearMaterials() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('\n💡 To get DATABASE_URL:');
    console.log('   1. Go to Railway Dashboard');
    console.log('   2. Select your PostgreSQL service');
    console.log('   3. Go to Variables tab');
    console.log('   4. Copy DATABASE_URL value');
    console.log('\n   Then run:');
    console.log('   DATABASE_URL="your-url" node scripts/clear-materials-railway.js');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🗑️  Connecting to database...');
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to database');
    
    // Get count before deletion
    const countResult = await pool.query('SELECT COUNT(*) FROM materials');
    const countBefore = parseInt(countResult.rows[0].count);
    console.log(`📊 Found ${countBefore} materials in database`);
    
    if (countBefore === 0) {
      console.log('✅ No materials to delete');
      await pool.end();
      process.exit(0);
    }
    
    // Delete all materials
    console.log('🗑️  Deleting all materials...');
    const result = await pool.query('DELETE FROM materials');
    
    console.log(`✅ Deleted ${result.rowCount} materials from database`);
    
    // Verify deletion
    const verifyResult = await pool.query('SELECT COUNT(*) FROM materials');
    const countAfter = parseInt(verifyResult.rows[0].count);
    
    if (countAfter === 0) {
      console.log('✅ All materials cleared successfully');
    } else {
      console.warn(`⚠️  Warning: ${countAfter} materials still remain`);
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing materials:', error.message);
    await pool.end();
    process.exit(1);
  }
}

clearMaterials();

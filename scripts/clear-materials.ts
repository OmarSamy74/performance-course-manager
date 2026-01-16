#!/usr/bin/env tsx
/**
 * Clear all materials from PostgreSQL database
 */

import pool from '../server/db/connection.js';

async function clearMaterials() {
  try {
    console.log('🗑️  Clearing all materials from database...');
    
    // Delete all materials
    const result = await pool.query('DELETE FROM materials');
    
    console.log(`✅ Deleted ${result.rowCount} materials from database`);
    console.log('✅ All materials cleared successfully');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error clearing materials:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearMaterials();
}

export { clearMaterials };

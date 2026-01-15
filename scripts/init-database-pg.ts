#!/usr/bin/env tsx
/**
 * PostgreSQL Database Initialization Script
 * 
 * Seeds initial data into PostgreSQL database
 */

import pool, { initDatabase } from '../server/db/connection.js';
import { UserRole } from '../types.js';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    // Initialize schema first
    await initDatabase();
    
    // Check if users already exist
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }
    
    console.log('🌱 Seeding database with initial data...');
    
    // Hash password function
    const hashPassword = async (password: string): Promise<string> => {
      const bcrypt = await import('bcryptjs');
      return bcrypt.default.hash(password, 10);
    };
    
    // Create users
    const users = [
      { username: 'admin', password: '123', role: UserRole.ADMIN },
      { username: 'teacher', password: '123', role: UserRole.TEACHER },
      { username: 'sales', password: '123', role: UserRole.SALES },
      { username: 'omar.samy', password: '123', role: UserRole.TEACHER },
      { username: 'abdelatif.reda', password: '123', role: UserRole.TEACHER },
      { username: 'karim.ali', password: '123', role: UserRole.TEACHER },
    ];
    
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await pool.query(
        'INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
        [randomUUID(), user.username, hashedPassword, user.role]
      );
    }
    
    console.log(`✅ Created ${users.length} users`);
    console.log('✅ Database seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };

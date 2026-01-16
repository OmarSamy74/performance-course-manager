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
    
    // Generate complex password (12 characters: uppercase, lowercase, numbers, symbols)
    const generateComplexPassword = (): string => {
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
    };
    
    // Default course ID for all teachers
    const DEFAULT_COURSE_ID = 'soccer-analytics-pro-performance-mastery';
    
    // Generate complex passwords for teachers
    const omarPassword = generateComplexPassword();
    const abdelatifPassword = generateComplexPassword();
    const karimPassword = generateComplexPassword();
    const teacherPassword = generateComplexPassword();
    
    // Store passwords for documentation
    const teacherPasswords = {
      'omar.samy': omarPassword,
      'abdelatif.reda': abdelatifPassword,
      'karim.ali': karimPassword,
      'teacher': teacherPassword,
    };
    
    console.log('\n📋 Teacher Passwords (SAVE THESE SECURELY):');
    console.log('==========================================');
    Object.entries(teacherPasswords).forEach(([username, password]) => {
      console.log(`${username}: ${password}`);
    });
    console.log('==========================================\n');
    
    // Create users
    const users = [
      { username: 'admin', password: '123', role: UserRole.ADMIN, courseId: null },
      { username: 'sales', password: '123', role: UserRole.SALES, courseId: null },
      { username: 'teacher', password: teacherPassword, role: UserRole.TEACHER, courseId: DEFAULT_COURSE_ID },
      { username: 'omar.samy', password: omarPassword, role: UserRole.TEACHER, courseId: DEFAULT_COURSE_ID },
      { username: 'abdelatif.reda', password: abdelatifPassword, role: UserRole.TEACHER, courseId: DEFAULT_COURSE_ID },
      { username: 'karim.ali', password: karimPassword, role: UserRole.TEACHER, courseId: DEFAULT_COURSE_ID },
    ];
    
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await pool.query(
        'INSERT INTO users (id, username, password, role, course_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING',
        [randomUUID(), user.username, hashedPassword, user.role, user.courseId]
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

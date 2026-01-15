#!/usr/bin/env node

/**
 * Railway Primary Database Setup Script
 * Automates the 3-step setup process using Railway CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe', ...options });
  } catch (error) {
    if (options.ignoreErrors) {
      return '';
    }
    throw error;
  }
}

async function main() {
  console.log('\n🗄️  Railway Primary Database Setup');
  console.log('====================================\n');

  // Check Railway CLI
  try {
    exec('railway --version');
    log('✅ Railway CLI installed', GREEN);
  } catch {
    log('❌ Railway CLI not found. Installing...', YELLOW);
    exec('npm install -g @railway/cli');
    log('✅ Railway CLI installed', GREEN);
  }

  // Check login
  try {
    exec('railway whoami');
    log('✅ Logged in to Railway', GREEN);
  } catch {
    log('⚠️  Not logged in. Please run: railway login', YELLOW);
    process.exit(1);
  }

  // Link project
  if (!fs.existsSync('.railway/project.json')) {
    log('\n🔗 Linking to Railway project...', BLUE);
    log('   (Select your existing project from the list)');
    try {
      exec('railway link', { stdio: 'inherit' });
    } catch {
      log('   Project already linked or manual selection needed', YELLOW);
    }
  }

  // Step 1: Volume
  console.log('\n📦 Step 1: Railway Volume');
  console.log('─────────────────────────');
  console.log('\n⚠️  Volume creation must be done via Railway Dashboard');
  console.log('   Railway CLI doesn\'t support volume creation yet.\n');
  console.log('   Please do this manually:');
  console.log('   1. Go to: Railway Dashboard → Your Service → Settings → Volumes');
  console.log('   2. Click "New Volume"');
  console.log('   3. Name: data-storage');
  console.log('   4. Mount Path: /data');
  console.log('   5. Click "Create"\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise(resolve => {
    readline.question('Press Enter after creating the volume...', () => {
      readline.close();
      resolve();
    });
  });

  // Step 2: Environment Variables
  console.log('\n⚙️  Step 2: Setting Environment Variables');
  console.log('─────────────────────────────────────────\n');

  const vars = {
    'DATA_DIR': '/data',
    'AUTO_INIT_DB': 'true',
    'NODE_ENV': 'production'
  };

  for (const [key, value] of Object.entries(vars)) {
    try {
      exec(`railway variables set ${key}=${value} --force`);
      log(`   ✅ ${key}=${value}`, GREEN);
    } catch (error) {
      log(`   ❌ Failed to set ${key}`, YELLOW);
    }
  }

  // Step 3: Initialize Database
  console.log('\n🗄️  Step 3: Initializing Database');
  console.log('─────────────────────────────────\n');

  try {
    exec('railway run npm run init-db:seed', { stdio: 'inherit' });
    log('✅ Database initialized successfully', GREEN);
  } catch (error) {
    log('⚠️  Database init may have failed (check logs)', YELLOW);
    log('   Database will auto-initialize on next deployment', YELLOW);
  }

  // Verify
  console.log('\n🔍 Verifying Setup');
  console.log('──────────────────\n');

  try {
    const vars = exec('railway variables');
    console.log('Environment Variables:');
    console.log(vars);
  } catch {
    log('   (Check Railway dashboard)', YELLOW);
  }

  console.log('\n📊 Database Collections (12 files in /data):');
  const collections = [
    'users.json - User accounts',
    'students.json - Student records',
    'leads.json - CRM leads',
    'materials.json - Course materials',
    'lessons.json - Lessons',
    'assignments.json - Assignments',
    'submissions.json - Submissions',
    'quizzes.json - Quizzes',
    'attempts.json - Quiz attempts',
    'progress.json - Progress tracking',
    'grades.json - Grades',
    'sessions.json - Active sessions'
  ];
  
  collections.forEach(collection => {
    console.log(`   - ${collection}`);
  });

  console.log('\n✨ Setup Complete!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Verify volume: Railway Dashboard → Volumes');
  console.log('   2. Check logs: railway logs');
  console.log('   3. Test API: curl https://your-railway-url.up.railway.app/api/students\n');
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});

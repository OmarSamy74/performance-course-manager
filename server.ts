import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import route handlers
import authRoutes from './server/routes/auth.js';
import usersRoutes from './server/routes/users.js';
import studentsRoutes from './server/routes/students.js';
import leadsRoutes from './server/routes/leads.js';
import materialsRoutes from './server/routes/materials.js';
import dashboardRoutes from './server/routes/dashboard.js';
import lessonsRoutes from './server/routes/lessons.js';
import assignmentsRoutes from './server/routes/assignments.js';
import quizzesRoutes from './server/routes/quizzes.js';
import progressRoutes from './server/routes/progress.js';
import gradesRoutes from './server/routes/grades.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Auto-initialize database on startup (PostgreSQL or File-based)
async function checkAndInitDatabase() {
  // Check if PostgreSQL is available
  if (process.env.DATABASE_URL) {
    try {
      console.log('🗄️  Initializing PostgreSQL database...');
      const { initDatabase } = await import('./server/db/connection.js');
      await initDatabase();
      
      // Seed initial data if needed
      const shouldSeed = process.env.AUTO_INIT_DB === 'true' || process.env.SEED_DB === 'true';
      if (shouldSeed) {
        const { seedDatabase } = await import('./scripts/init-database-pg.js');
        await seedDatabase();
      }
      
      // Reset users from MD file on deploy if enabled
      if (process.env.RESET_USERS_ON_DEPLOY === 'true') {
        try {
          console.log('🔐 Resetting users from USER_PASSWORDS.md on deploy...');
          // Import and run the reset function directly
          const { resetUsersFromMD } = await import('./scripts/reset-users-from-md.js');
          await resetUsersFromMD();
        } catch (error: any) {
          console.error('⚠️  User reset failed (non-blocking):', error.message);
          console.error('   Error details:', error);
          // Don't block deployment if user reset fails
        }
      }
      
      // Update passwords on deploy if enabled (alternative method)
      if (process.env.UPDATE_PASSWORDS_ON_DEPLOY === 'true') {
        try {
          console.log('🔐 Updating passwords on deploy...');
          // Import and run the update function directly
          const { updatePasswordsOnDeploy } = await import('./scripts/update-passwords-on-deploy.js');
          await updatePasswordsOnDeploy();
        } catch (error: any) {
          console.error('⚠️  Password update failed (non-blocking):', error.message);
          console.error('   Error details:', error);
          // Don't block deployment if password update fails
        }
      }
      
      console.log('✅ PostgreSQL database initialized successfully');
      return;
    } catch (error) {
      console.error('⚠️  Failed to initialize PostgreSQL:', error);
      throw error;
    }
  }
  
  // Fallback to file-based storage
  const shouldAutoInit = process.env.AUTO_INIT_DB === 'true' || process.env.NODE_ENV === 'production';
  
  if (!shouldAutoInit) {
    return;
  }

  try {
    const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');
    const usersFile = join(DATA_DIR, 'users.json');
    
    // Check if database is initialized
    try {
      await fs.access(usersFile);
      // Database exists, skip initialization
      return;
    } catch {
      // Database doesn't exist, initialize it
      console.log('📦 File-based database not found, initializing...');
      const { initDatabase } = await import('./scripts/init-database.js');
      await initDatabase();
      console.log('✅ File-based database initialized successfully');
    }
  } catch (error) {
    console.error('⚠️  Failed to auto-initialize file-based database:', error);
    console.log('💡 Run "npm run init-db" manually to initialize the database');
  }
}

// Middleware
app.use(cors());
// Increase body size limit to 50MB for Base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/grades', gradesRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle React routing, return all non-API requests to React app
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
async function startServer() {
  // Check and initialize database if needed
  await checkAndInitDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Data directory: ${process.env.DATA_DIR || join(process.cwd(), 'data')}`);
  });
}

startServer();

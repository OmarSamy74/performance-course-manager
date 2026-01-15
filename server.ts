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

// Auto-initialize database if needed (optional, set AUTO_INIT_DB=true to enable)
async function checkAndInitDatabase() {
  if (process.env.AUTO_INIT_DB !== 'true') {
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
      console.log('📦 Database not found, initializing...');
      const { initDatabase } = await import('./scripts/init-database.js');
      await initDatabase();
      console.log('✅ Database initialized successfully');
    }
  } catch (error) {
    console.error('⚠️  Failed to auto-initialize database:', error);
    console.log('💡 Run "npm run init-db" manually to initialize the database');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
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

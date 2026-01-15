import { Pool, PoolConfig } from 'pg';

// Get PostgreSQL connection from Railway environment variables
// Railway automatically provides these when PostgreSQL service is added
const getDbConfig = (): PoolConfig => {
  // Railway provides DATABASE_URL when PostgreSQL is added
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  // Fallback to individual connection parameters
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'railway',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};

// Create connection pool
const pool = new Pool(getDbConfig());

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Initialize database schema
export async function initDatabase() {
  try {
    // Check if tables already exist
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('✅ Database schema already exists');
      return;
    }
    
    console.log('📝 Creating database schema...');
    
    // Create tables directly (more reliable than reading SQL file)
    await createTablesDirectly();
    
    console.log('✅ Database schema initialized');
  } catch (error: any) {
    console.error('❌ Error initializing database:', error);
    // Don't throw - allow app to continue with file-based storage fallback
    console.log('⚠️  Will fall back to file-based storage if PostgreSQL fails');
  }
}

// Create tables directly
async function createTablesDirectly() {
  // Enable UUID extension
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'STUDENT', 'SALES', 'TEACHER')),
      student_id UUID,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      token VARCHAR(255) UNIQUE NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Students table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      plan VARCHAR(50) NOT NULL CHECK (plan IN ('FULL', 'HALF')),
      user_id UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Installments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS installments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      installment_key VARCHAR(10) NOT NULL CHECK (installment_key IN ('inst1', 'inst2', 'inst3')),
      status VARCHAR(50) NOT NULL CHECK (status IN ('UNPAID', 'PENDING', 'PAID', 'REJECTED')),
      proof_url TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, installment_key)
    );
  `);
  
  // Leads table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL CHECK (status IN ('NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATION', 'CONVERTED', 'LOST')),
      source VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_contacted_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Materials table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('PDF', 'IMAGE')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Lessons table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content TEXT,
      video_url TEXT,
      module_id VARCHAR(255),
      order_index INTEGER DEFAULT 0,
      duration INTEGER,
      prerequisites TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Assignments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date TIMESTAMP,
      max_score INTEGER DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Submissions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      file_url TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      score INTEGER,
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Quizzes table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      questions JSONB NOT NULL,
      time_limit INTEGER,
      passing_score INTEGER DEFAULT 60,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Quiz attempts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      answers JSONB NOT NULL,
      score INTEGER,
      time_spent INTEGER,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Progress table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      lesson_id VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      progress_percentage INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      last_accessed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, lesson_id)
    );
  `);
  
  // Grades table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS grades (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
      quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Create indexes
  await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_installments_student_id ON installments(student_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id)');
  
  console.log('✅ All tables created successfully');
}

export default pool;

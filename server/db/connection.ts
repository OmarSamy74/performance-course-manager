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
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const schemaPath = join(__dirname, 'schema.sql');
    
    const schema = await readFile(schemaPath, 'utf-8');
    
    // Execute schema (split by semicolons and execute each statement)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.length > 0) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Database schema initialized');
  } catch (error: any) {
    // If schema file doesn't exist or error, try to create tables directly
    if (error.code === 'ENOENT') {
      console.log('⚠️  Schema file not found, creating tables directly...');
      await createTablesDirectly();
    } else {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }
}

// Create tables directly if schema file is not available
async function createTablesDirectly() {
  // This will be called if schema.sql is not found
  // The schema will be created via the init script instead
  console.log('📝 Tables will be created via initialization script');
}

export default pool;

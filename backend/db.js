const { Pool } = require('pg');

// Master database pool
const masterPool = new Pool({
  host: process.env.MASTER_DB_HOST || process.env.DB_HOST,
  port: process.env.MASTER_DB_PORT || process.env.DB_PORT || 5432,
  database: process.env.MASTER_DB_NAME || process.env.DB_NAME,
  user: process.env.MASTER_DB_USER || process.env.DB_USER,
  password: process.env.MASTER_DB_PASSWORD || process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

masterPool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

module.exports = { masterPool };

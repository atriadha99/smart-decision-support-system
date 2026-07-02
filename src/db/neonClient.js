import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL || '';

let sqlInstance = null;

if (databaseUrl && !databaseUrl.includes('placeholder')) {
  try {
    sqlInstance = neon(databaseUrl);
  } catch (e) {
    console.error("Failed to initialize Neon client:", e);
  }
}

export const sql = sqlInstance;

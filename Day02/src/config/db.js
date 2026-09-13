const prisma = require('./prisma');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL environment variable is not defined');
    return;
  }
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    throw err;
  }
}

module.exports = main;
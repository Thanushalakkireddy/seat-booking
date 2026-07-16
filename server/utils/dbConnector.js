const { PrismaClient } = require('@prisma/client');

function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }
  
  const url = new URL(dbUrl);
  const dbName = url.pathname.substring(1);
  
  if (!dbName || dbName === '') {
    throw new Error('Database name is missing from DATABASE_URL. Please include a database name after the hostname.');
  }
  return dbName;
}

validateDatabaseUrl();

const prisma = new PrismaClient();

const ConnectDB = async () => {
  try {
    await prisma.$connect();
    console.log('DB connected');
  } catch (err) {
    console.log(err);
  }
};

module.exports = { prisma, ConnectDB };

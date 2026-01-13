import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test creating a sample user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        pass: 'hashed_password',
        role: 'user'
      }
    });
    
    console.log('✅ Database connection successful!');
    console.log('✅ Test user created:', user);
    
    // Clean up - delete the test user
    await prisma.user.delete({
      where: {
        id: user.id
      }
    });
    
    console.log('✅ Test user cleaned up');
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
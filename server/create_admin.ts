
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123';
  const name = 'Admin User';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password_hash: hashedPassword,
        role: 'admin',
        full_name: name
      },
      create: {
        email,
        password_hash: hashedPassword,
        full_name: name,
        role: 'admin',
        uid: email, // Using email as uid for simplicity
        provider: 'local',
        gender: 'male', // Default
        date_of_birth: new Date('2000-01-01')
      }
    });

    console.log('Admin user created/updated:', user);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

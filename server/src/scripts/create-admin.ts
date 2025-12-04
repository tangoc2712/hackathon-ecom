import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const createAdmin = async () => {
    const email = 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'Admin',
                role_id: 1,
                password_hash: hashedPassword, // Ensure password is set even if user exists
            },
            create: {
                email,
                password_hash: hashedPassword,
                full_name: 'Admin User',
                role: 'Admin',
                role_id: 1,
                uid: 'admin_uid_' + Date.now(),
                provider: 'local',
                gender: 'other',
                date_of_birth: new Date(),
            },
        });
        console.log('Admin user created successfully:');
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
};

createAdmin();

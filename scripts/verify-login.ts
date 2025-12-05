import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@demo.com';
    const password = 'password123';

    console.log(`Attempting to verify login for ${email}...`);

    try {
        const user = await prisma.member.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('User found:', user.id);
        console.log('Stored hash:', user.password);

        const isValid = await bcrypt.compare(password, user.password);
        console.log(`Password '${password}' is valid: ${isValid}`);

        if (!isValid) {
            console.log('Testing hash generation...');
            const newHash = await bcrypt.hash(password, 10);
            console.log('New hash would be:', newHash);
            const compareNew = await bcrypt.compare(password, newHash);
            console.log('Comparing against new hash:', compareNew);
        }

    } catch (e) {
        console.error('Error verifying login:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

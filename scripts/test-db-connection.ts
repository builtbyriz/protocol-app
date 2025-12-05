import { prisma } from '../lib/db.ts';

async function main() {
    try {
        console.log('Testing connection from lib/db...');
        const count = await prisma.member.count();
        console.log(`Successfully connected! Member count: ${count}`);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        // @ts-ignore
        await prisma.$disconnect();
    }
}

main();

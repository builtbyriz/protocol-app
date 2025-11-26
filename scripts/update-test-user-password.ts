
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
    console.log("🔑 Updating Test User Password...")

    // Hash "password"
    const hashedPassword = await bcrypt.hash("password", 10)

    // Update all test members
    const result = await prisma.member.updateMany({
        where: { email: { startsWith: 'test_member_' } },
        data: { password: hashedPassword }
    })

    console.log(`   ✅ Updated passwords for ${result.count} test members to 'password'`)
}

main()

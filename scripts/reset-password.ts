
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function resetPassword() {
    const email = "test_member_1763880250245@example.com"
    const password = "password"
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.member.update({
        where: { email },
        data: { password: hashedPassword },
    })

    console.log(`Password for ${user.email} reset to '${password}'`)
}

resetPassword()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

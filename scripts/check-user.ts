
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkUser() {
    const email = "test_member_1763880250245@example.com"
    const user = await prisma.member.findUnique({
        where: { email },
    })

    if (user) {
        console.log(`User found: ${user.email}`)
        console.log(`Password hash: ${user.password}`)
    } else {
        console.log("User NOT found")
    }
}

checkUser()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

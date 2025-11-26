import { getMembers } from "@/app/actions/admin"
import { prisma } from "@/lib/db"

async function main() {
    const gym = await prisma.gym.findUnique({
        where: { slug: "demo-gym" }
    })

    if (!gym) {
        console.error("Gym not found")
        return
    }

    console.log("Fetching members for gym:", gym.name)
    const members = await getMembers(gym.id, "")
    console.log("Members found:", members.length)
    console.log(members)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

import { prisma } from '@/lib/db'

async function main() {
    const folderId = '1bfDw7OzRmM17qJVl6uq9macGEh0klLdI'

    console.log(`Updating demo-gym with Drive Folder ID: ${folderId}...`)

    try {
        const gym = await prisma.gym.update({
            where: { slug: 'demo-gym' },
            data: { driveFolder: folderId }
        })
        console.log('Update successful:', gym)
    } catch (error) {
        console.error('Update failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()

import { listFilesInFolder } from '@/lib/google-drive'
import { prisma } from '@/lib/db'

async function main() {
    const gym = await prisma.gym.findUnique({
        where: { slug: 'demo-gym' }
    })

    if (!gym || !gym.driveFolder) {
        console.error('Gym or Drive Folder not found')
        return
    }

    console.log(`Checking files for ${gym.name} in folder: ${gym.driveFolder}`)

    try {
        const files = await listFilesInFolder(gym.driveFolder)
        console.log(`Found ${files.length} files:`)
        files.forEach(f => console.log(`- ${f.name} (${f.mimeType})`))
    } catch (error) {
        console.error('Failed to list files:', error)
    }
}

main()

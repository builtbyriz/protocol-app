import { listFilesInFolder } from '@/lib/google-drive'
import { processDocument } from '@/lib/ingestion'
import { prisma } from '@/lib/db'

async function main() {
    const gym = await prisma.gym.findUnique({
        where: { slug: 'demo-gym' }
    })

    if (!gym || !gym.driveFolder) {
        console.error('Gym or Drive Folder not found')
        return
    }

    console.log(`Ingesting for ${gym.name} from folder ${gym.driveFolder}...`)

    try {
        const files = await listFilesInFolder(gym.driveFolder)
        console.log(`Found ${files.length} files.`)

        for (const file of files) {
            console.log(`Processing ${file.name}...`)
            await processDocument(gym.id, file.id!, file.name!, file.mimeType!)
        }

        console.log('Ingestion complete.')
    } catch (error) {
        console.error('Ingestion failed:', error)
    }
}

main()

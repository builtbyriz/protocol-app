import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const gymSlug = 'demo-gym'
    let gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })

    if (!gym) {
        console.log('Gym not found, creating...')
        gym = await prisma.gym.create({
            data: {
                slug: gymSlug,
                name: 'Demo Gym',
            }
        })
    }

    // Create a workout if not exists
    let workout = await prisma.workout.findFirst({
        where: { gymId: gym.id, title: 'Community Test Workout' }
    })

    if (!workout) {
        workout = await prisma.workout.create({
            data: {
                title: 'Community Test Workout',
                description: 'A test workout for community features',
                workoutType: 'For Time',
                movements: '10 Burpees\n10 Pushups',
                gymId: gym.id,
                date: new Date(),
            }
        })
        console.log('Created workout:', workout.title)
    }

    // Create some dummy members
    const members = [
        { name: 'Alice Test', email: 'alice@test.com' },
        { name: 'Bob Test', email: 'bob@test.com' },
        { name: 'Charlie Test', email: 'charlie@test.com' },
    ]

    for (const m of members) {
        let member = await prisma.member.findUnique({
            where: { email: m.email }
        })

        if (!member) {
            member = await prisma.member.create({
                data: {
                    ...m,
                    gymId: gym.id,
                    password: 'password123' // Dummy password
                }
            })
            console.log('Created member:', member.name)
        }

// Log a result for them
const existingResult = await prisma.result.findFirst({
    where: { memberId: member.id, workoutId: workout!.id }
})

if (!existingResult) {
    await prisma.result.create({
        data: {
            memberId: member.id,
            workoutId: workout!.id,
            result: `${Math.floor(Math.random() * 10) + 5}:00`, // Random time
            loggedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)) // Random time ago
        }
    })
    console.log('Logged result for:', member.name)
}
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

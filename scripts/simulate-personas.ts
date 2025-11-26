
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to simulate a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
    console.log("🚀 Starting Extended 3-Day Persona Simulation (MY/SG)...")

    // 1. Setup Gym
    const gymSlug = "demo-gym"
    let gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
    if (!gym) {
        gym = await prisma.gym.create({
            data: { name: "Protocol SG", slug: gymSlug, aiTone: "motivational" }
        })
    }

    const personas = [
        {
            name: "Ahmad",
            type: "Easy",
            origin: "Malaysia",
            style: "Motivated, uses 'lah', friendly.",
            goals: "Get fit, lose weight",
            journey: [
                {
                    day: 1,
                    chat: "Hi coach! I want to start fresh today. What to do?",
                    workout: "Full Body Circuit",
                    result: "Completed 3 rounds",
                    aiResponse: "Bagus Ahmad! Great start. 3 rounds is solid. Drink plenty of water ok?"
                },
                {
                    day: 2,
                    chat: "Aiyoh, my legs sore lah from yesterday. Should I rest?",
                    workout: "Active Recovery (Walking)",
                    result: "30 mins walk",
                    aiResponse: "Sore is normal lah, means muscles growing! Active recovery is perfect. Keep moving gently."
                },
                {
                    day: 3,
                    chat: "Feeling better today! Ready to smash it again.",
                    workout: "Full Body Circuit",
                    result: "Completed 4 rounds",
                    aiResponse: "Wah, 4 rounds today? That's progress! You're getting stronger fast. Keep it up!"
                }
            ]
        },
        {
            name: "Sarah",
            type: "Intermediate",
            origin: "Singapore",
            style: "Efficient, busy, uses 'can/cannot'.",
            goals: "Tone up, efficiency",
            journey: [
                {
                    day: 1,
                    chat: "Only have 20 mins. HIIT can?",
                    workout: "Tabata Sprints",
                    result: "8 rounds, max effort",
                    aiResponse: "Can! Tabata is perfect for you. 8 rounds is intense. Good job making time."
                },
                {
                    day: 2,
                    chat: "Got a bit more time today. Maybe weights?",
                    workout: "Dumbbell Thrusters",
                    result: "12kg x 10 reps x 3 sets",
                    aiResponse: "Solid choice. 12kg is a good weight. Focus on form. Efficient and effective."
                },
                {
                    day: 3,
                    chat: "Super busy again. Quick core workout?",
                    workout: "Core Blaster",
                    result: "10 mins non-stop",
                    aiResponse: "Understood. 10 mins core is better than nothing. Consistency is key, Sarah!"
                }
            ]
        },
        {
            name: "Uncle Tan",
            type: "Difficult",
            origin: "SG/MY",
            style: "Skeptical, complains, heavy Singlish.",
            goals: "Fix knee pain, value for money",
            journey: [
                {
                    day: 1,
                    chat: "Walao, why this app so complicated? I just want fix knee pain.",
                    workout: "Knee Rehab (Step ups)",
                    result: "Did 10 reps, pain level 4/10",
                    aiResponse: "Uncle Tan, slowly lah. App is here to help. 4/10 pain means we go easy. Don't force."
                },
                {
                    day: 2,
                    chat: "My knee still pain leh. This exercise useless one.",
                    workout: "Swimming",
                    result: "20 laps",
                    aiResponse: "Swimming is very good, low impact! Good for knee. Give it time, Uncle. Cannot rush recovery."
                },
                {
                    day: 3,
                    chat: "Ok, knee feel abit better today. Maybe can try squat?",
                    workout: "Box Squats",
                    result: "Bodyweight, 10 reps",
                    aiResponse: "Good to hear! Box squat is safer. If pain comes back, stop immediately ok? Safety first."
                }
            ]
        }
    ]

    for (const p of personas) {
        console.log(`\n===================================================`)
        console.log(`👤 CLIENT PROFILE: ${p.name}`)
        console.log(`📍 Origin: ${p.origin} | Type: ${p.type}`)
        console.log(`🎯 Goals: ${p.goals}`)
        console.log(`📝 Style: ${p.style}`)
        console.log(`===================================================`)

        // Create temp member
        const member = await prisma.member.create({
            data: {
                email: `sim-3day-${p.name.toLowerCase().replace(' ', '')}-${Date.now()}@test.com`,
                name: p.name,
                password: "hashed",
                gymId: gym.id
            }
        })

        for (const day of p.journey) {
            console.log(`\n📅 DAY ${day.day}`)
            console.log(`---------------------------------------------------`)

            // 1. Chat Interaction
            console.log(`💬 ${p.name}: "${day.chat}"`)
            await delay(500)
            console.log(`🤖 AI Coach: [Thinking...]`)
            await delay(800)
            // In a real app, this would come from the API. We simulate the persona-aware response here.
            // The key is that the response matches the persona's tone and context.
            // We are verifying the *design* of the interaction flow.
            console.log(`🤖 AI Coach: "${day.aiResponse}"`)

            // 2. Log Workout
            console.log(`\n🏋️ LOGGING WORKOUT: ${day.workout}`)
            const workout = await prisma.workout.create({
                data: {
                    title: day.workout,
                    description: "Simulation Workout",
                    workoutType: "Circuit",
                    movements: day.workout,
                    date: new Date(),
                    gymId: gym.id
                }
            })

            await prisma.result.create({
                data: {
                    memberId: member.id,
                    workoutId: workout.id,
                    result: day.result,
                    notes: `Day ${day.day} simulation`
                }
            })
            console.log(`✅ Result Logged: "${day.result}"`)

            // 3. AI Analysis of Result (Simulated)
            console.log(`📈 AI Analysis: "Good job on the ${day.workout}. Added to your history."`)

            await delay(1000)
        }

        // Cleanup
        await prisma.result.deleteMany({ where: { memberId: member.id } })
        await prisma.member.delete({ where: { id: member.id } })
    }

    // Cleanup Workouts (optional, but keeps DB clean)
    // await prisma.workout.deleteMany({ where: { description: "Simulation Workout" } })

    console.log(`\n===================================================`)
    console.log("✅ 3-Day Simulation Complete. All personas processed.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

import { prisma } from "@/lib/db"

export async function checkAndSavePRs(
    memberId: string,
    movementsStr: string,
    result: string,
    workoutType: string
): Promise<{ movement: string, bestResult: string }[]> {
    if (!movementsStr) return []

    const movements = movementsStr.split('\n').map(m => m.trim()).filter(Boolean)
    const newPRs: { movement: string, bestResult: string }[] = []

    // Simple parsing logic:
    // If workout type is "Weight", the result is likely the weight (e.g., "100kg")
    // If workout type is "For Time", the result is time (lower is better)
    // If workout type is "AMRAP", result is rounds/reps (higher is better)

    // For now, we'll implement a basic "Weight" PR tracker as it's the most common 1-to-1 mapping
    // Complex workouts (like "Fran") can also be tracked if the movement name is "Fran"

    for (const movement of movements) {
        // Check if we can parse a value from the result
        // This is a simplified version. Real-world would need robust parsing.

        const existingPR = await prisma.pR.findUnique({
            where: {
                memberId_movement: {
                    memberId,
                    movement,
                }
            }
        })

        const isBetter = compareResults(result, existingPR?.bestResult, workoutType)

        if (isBetter) {
            await prisma.pR.upsert({
                where: {
                    memberId_movement: {
                        memberId,
                        movement,
                    }
                },
                update: {
                    bestResult: result,
                    achievedAt: new Date(),
                },
                create: {
                    memberId,
                    movement,
                    bestResult: result,
                    achievedAt: new Date(),
                }
            })

            newPRs.push({ movement, bestResult: result })
        }
    }

    return newPRs
}

function compareResults(newResult: string, oldResult: string | undefined, type: string): boolean {
    if (!oldResult) return true // First time is always a PR

    try {
        if (type === "Weight") {
            const newVal = parseWeight(newResult)
            const oldVal = parseWeight(oldResult)
            return newVal > oldVal
        }

        if (type === "For Time") {
            // Assuming format MM:SS or just seconds
            // This is tricky without strict validation. 
            // For now, let's assume standard string comparison for simple cases, 
            // but ideally we convert to seconds.
            return newResult < oldResult
        }

        if (type === "AMRAP" || type === "Rounds") {
            // Higher is better
            // Simple string compare might fail for "10 rounds" vs "9 rounds" (1 < 9 in string)
            // So we need to parse numbers.
            const newVal = parseFloat(newResult)
            const oldVal = parseFloat(oldResult)
            if (!isNaN(newVal) && !isNaN(oldVal)) {
                return newVal > oldVal
            }
        }
    } catch (e) {
        console.error("Error comparing results", e)
    }

    return false // Default to no PR if unsure
}

function parseWeight(val: string): number {
    const num = parseFloat(val.replace(/[^0-9.]/g, ''))
    return isNaN(num) ? 0 : num
}

import { GymProvider } from "@/components/gym-provider"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export const runtime = 'edge'

export default async function GymLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const gym = await prisma.gym.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            primaryColor: true,
            logoUrl: true,
        },
    })

    if (!gym) {
        notFound()
    }

    return (
        <GymProvider gym={gym}>
            {children}
        </GymProvider>
    )
}


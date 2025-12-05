import { SettingsForm } from "@/components/admin/settings-form"


export default async function SettingsPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const { prisma } = await import("@/lib/db")
    const gym = await prisma.gym.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            primaryColor: true,
            aiTone: true
        }
    })

    if (!gym) return <div>Gym not found</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Gym Settings</h1>
            <SettingsForm gym={gym} />
        </div>
    )
}

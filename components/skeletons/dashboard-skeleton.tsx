import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="flex flex-col gap-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>

            <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="py-4 border rounded-md border-dashed space-y-2 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
            </div>
        </div>
    )
}

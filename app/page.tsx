import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'




export default async function Home() {
  const session = await auth()

  if (session?.user) {
    // @ts-ignore
    const slug = session.user.gymSlug || 'demo-gym'
    redirect(`/${slug}/member`)
  }

  redirect('/login')
}

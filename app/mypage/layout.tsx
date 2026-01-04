import { getServerAuthSession } from "@/lib/get-server-session"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"

export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}


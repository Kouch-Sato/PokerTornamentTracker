import { getServerAuthSession } from "@/lib/get-server-session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function MyPage() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return null
  }

  const tournaments = await prisma.tournament.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
        <Link
          href="/mypage/tournaments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          トーナメントを作成
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">まだトーナメントが登録されていません</p>
          <Link
            href="/mypage/tournaments/new"
            className="text-blue-600 hover:text-blue-700"
          >
            最初のトーナメントを作成する
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/mypage/tournaments/${tournament.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tournament.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  日時: {new Date(tournament.date).toLocaleString("ja-JP")}
                </p>
                <p>バイイン: ¥{tournament.buyIn.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


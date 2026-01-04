import { getServerAuthSession } from "@/lib/get-server-session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { TournamentForm } from "@/components/TournamentForm"
import { DeleteTournamentButton } from "@/components/DeleteTournamentButton"

export default async function TournamentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
  })

  if (!tournament) {
    redirect("/mypage")
  }

  if (tournament.userId !== session.user.id) {
    redirect("/mypage")
  }

  // 日時をフォーム用の形式に変換
  const dateValue = new Date(tournament.date)
    .toISOString()
    .slice(0, 16)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/mypage"
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          ← マイページに戻る
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">トーナメント詳細</h1>
          <DeleteTournamentButton tournamentId={tournament.id} />
        </div>

        <TournamentForm
          tournamentId={tournament.id}
          initialData={{
            name: tournament.name,
            date: dateValue,
            buyIn: tournament.buyIn.toString(),
          }}
        />
      </div>
    </div>
  )
}


'use client'

import { useState } from "react"
import { deleteTournament } from "@/actions/tournaments"
import { useRouter } from "next/navigation"

interface DeleteTournamentButtonProps {
  tournamentId: string
}

export function DeleteTournamentButton({ tournamentId }: DeleteTournamentButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) {
      return
    }

    setLoading(true)
    const result = await deleteTournament(tournamentId)
    
    if (result?.error) {
      alert(result.error)
      setLoading(false)
      setShowConfirm(false)
    } else if (result?.success && result.redirect) {
      router.push(result.redirect)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex space-x-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded disabled:opacity-50"
        >
          {loading ? "削除中..." : "削除する"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1 px-3 rounded"
        >
          キャンセル
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded"
    >
      削除
    </button>
  )
}


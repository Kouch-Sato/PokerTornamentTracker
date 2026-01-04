'use client'

import { useState } from "react"
import { updateTournament } from "@/actions/tournaments"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TournamentFormProps {
  tournamentId: string
  initialData: {
    name: string
    date: string
    buyIn: string
  }
}

export function TournamentForm({ tournamentId, initialData }: TournamentFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateTournament(tournamentId, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      if (result.redirect) {
        router.push(result.redirect)
      }
    } else if (result?.success && result.redirect) {
      router.push(result.redirect)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          トーナメント名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={initialData.name}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          日時 <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={initialData.date}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="buyIn" className="block text-sm font-medium text-gray-700 mb-1">
          バイイン金額（円） <span className="text-red-500">*</span>
        </label>
        <input
          id="buyIn"
          name="buyIn"
          type="number"
          required
          min="0"
          step="1"
          defaultValue={initialData.buyIn}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          {loading ? "更新中..." : "更新"}
        </button>
        <Link
          href="/mypage"
          className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
        >
          キャンセル
        </Link>
      </div>
    </form>
  )
}


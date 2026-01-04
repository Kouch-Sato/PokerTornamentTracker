'use client'

import { useState } from "react"
import { createTournament } from "@/actions/tournaments"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewTournamentPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createTournament(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      if (result.redirect) {
        router.push(result.redirect)
      }
    } else if (result?.success) {
      router.push("/mypage")
    }
  }

  // デフォルト値を現在の日時に設定
  const now = new Date()
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
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

      <h1 className="text-3xl font-bold text-gray-900 mb-8">トーナメントを作成</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="例: 週末トーナメント"
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
            defaultValue={defaultDateTime}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="例: 5000"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? "作成中..." : "作成"}
          </button>
          <Link
            href="/mypage"
            className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}


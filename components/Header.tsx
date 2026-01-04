'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/mypage" className="text-xl font-bold text-gray-900">
            ポーカートーナメント記録
          </Link>
          {session && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


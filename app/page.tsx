import { getServerAuthSession } from "@/lib/get-server-session"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerAuthSession()

  if (session) {
    redirect("/mypage")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ポーカートーナメント記録アプリ
          </h1>
          <p className="text-gray-600 mb-8">
            トーナメントの参加記録を管理しましょう
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            アカウント作成
          </Link>
        </div>
      </div>
    </div>
  )
}


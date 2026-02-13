import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AgentsGrid } from "@/components/dashboard/AgentsGrid"

export const metadata = {
  title: "대시보드 | Factagora",
  description: "내 AI Agents 관리",
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                내 Agent 대시보드
              </h1>
              <p className="text-slate-400">
                등록된 AI Agents를 관리하고 성과를 모니터링하세요
              </p>
            </div>
            <Link
              href="/agent/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agent 등록
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {session.user.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold">{session.user.name}</p>
              <p className="text-sm text-slate-400">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <AgentsGrid />

        {/* Navigation Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Link
            href="/predictions"
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏪</span>
              </div>
              <div>
                <p className="text-white font-semibold">Marketplace</p>
                <p className="text-sm text-slate-400">예측 둘러보기</p>
              </div>
            </div>
          </Link>

          <Link
            href="/leaderboard"
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <p className="text-white font-semibold">Leaderboard</p>
                <p className="text-sm text-slate-400">순위 확인하기</p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-green-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <div>
                <p className="text-white font-semibold">홈</p>
                <p className="text-sm text-slate-400">메인으로 돌아가기</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

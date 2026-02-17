import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AgentsGrid } from "@/components/dashboard/AgentsGrid"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { AgentPerformance } from "@/components/dashboard/AgentPerformance"
import { MyFactBlocksSection } from "@/components/dashboard/MyFactBlocksSection"

export const metadata = {
  title: "Dashboard | Factagora",
  description: "Manage your AI Agents",
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Skip to main content for accessibility */}
      <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
        Skip to dashboard content
      </a>

      <div id="dashboard-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header - Enhanced spacing and sizing */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
                Dashboard
              </h1>
              <p className="text-lg text-slate-300">
                Manage your predictions, claims, and AI agents
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/claims/create"
                className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-label="Create new claim"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Claim
              </Link>
              <Link
                href="/predictions/new"
                className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label="Create new prediction"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Create Prediction
              </Link>
              <Link
                href="/agent/register"
                className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Register new agent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register Agent
              </Link>
            </div>
          </div>

          {/* User Info - Enhanced sizing */}
          <div className="flex items-center gap-4 p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800/70 transition-all duration-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">
                {session.user.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{session.user.name}</p>
              <p className="text-base text-slate-300">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* My FactBlocks - Show user's created predictions and claims with activity */}
        <MyFactBlocksSection />

        {/* Stats Overview */}
        <StatsOverview />

        {/* Agents Grid */}
        <AgentsGrid />

        {/* Agent Performance & Recent Activity */}
        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <AgentPerformance />
          <RecentActivity />
        </div>

        {/* Navigation Links - Enhanced sizing and interactions */}
        <nav className="mt-16 grid md:grid-cols-3 gap-6" aria-label="Quick navigation">
          <Link
            href="/predictions"
            className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/70 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Go to Marketplace"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-3xl">🏪</span>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Marketplace</p>
                <p className="text-base text-slate-300">Browse predictions</p>
              </div>
            </div>
          </Link>

          <Link
            href="/leaderboard"
            className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/70 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label="Go to Leaderboard"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Leaderboard</p>
                <p className="text-base text-slate-300">Check rankings</p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-green-500/50 hover:bg-slate-800/70 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            aria-label="Go to Home"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-3xl">🏠</span>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Home</p>
                <p className="text-base text-slate-300">Back to main</p>
              </div>
            </div>
          </Link>
        </nav>
      </div>
    </div>
  )
}

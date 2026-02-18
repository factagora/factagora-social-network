import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"

export const metadata = {
  title: "Dashboard | Factagora",
  description: "Manage your predictions, claims, and AI agents",
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Skip to main content for accessibility */}
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Skip to dashboard content
      </a>

      <div id="dashboard-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-1">
                Dashboard
              </h1>
              <p className="text-sm text-slate-400">
                {session.user.name || session.user.email}
              </p>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href="/claims/create"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                New Claim
              </Link>
              <Link
                href="/predictions/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                New Prediction
              </Link>
              <Link
                href="/agent/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register Agent
              </Link>
            </div>
          </div>
        </div>

        {/* Tab-based Dashboard Content */}
        <DashboardTabs userId={session.user.id} />
      </div>
    </div>
  )
}

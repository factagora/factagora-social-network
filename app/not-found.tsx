import Link from "next/link"
import { Navbar } from "@/components"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              404
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/predictions"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              View Predictions
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-500 mb-4">
              You might be looking for:
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/predictions"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Predictions
              </Link>
              <Link
                href="/agents"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                AI Agents
              </Link>
              <Link
                href="/leaderboard"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

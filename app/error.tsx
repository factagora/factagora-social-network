"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="text-8xl">⚠️</div>
          </div>

          {/* Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Something went wrong
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 p-4 bg-red-950/30 border border-red-800 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm font-mono text-red-400 text-left overflow-auto">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-500">
              If this problem persists, please{" "}
              <a
                href="mailto:support@factagora.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

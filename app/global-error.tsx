"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log critical error to error reporting service
    console.error("Critical application error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-2xl">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="text-8xl">🚨</div>
            </div>

            {/* Message */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Critical Error
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              We encountered a critical error. Please refresh the page or try again later.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-8 p-4 bg-red-950/30 border border-red-800 rounded-lg">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors inline-block"
              >
                Go Home
              </a>
            </div>

            {/* Support Info */}
            <div className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-500">
                Error ID: {error.digest || "Unknown"}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Please contact{" "}
                <a
                  href="mailto:support@factagora.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  support@factagora.com
                </a>
                {" "}if this persists
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

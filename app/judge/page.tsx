"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Prediction {
  id: string
  title: string
  description: string
  category: string
  deadline: string
}

interface Claim {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
}

type JudgeItem =
  | { type: "prediction"; data: Prediction }
  | { type: "claim"; data: Claim }

export default function JudgePage() {
  const router = useRouter()
  const [items, setItems] = useState<JudgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchItems()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      setIsAuthenticated(!!data.user)
    } catch (error) {
      console.error("Failed to check auth:", error)
      setIsAuthenticated(false)
    } finally {
      setAuthChecking(false)
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)

      // Fetch predictions and claims
      const [predRes, claimRes] = await Promise.all([
        fetch("/api/predictions?status=open&limit=20"),
        fetch("/api/claims?limit=20"),
      ])

      const predictions = predRes.ok ? await predRes.json() : []
      const claimsData = claimRes.ok ? await claimRes.json() : { claims: [] }
      const claims = claimsData.claims || []

      // Mix predictions and claims
      const mixedItems: JudgeItem[] = []
      const maxLength = Math.max(predictions.length, claims.length)

      for (let i = 0; i < maxLength; i++) {
        if (predictions[i]) {
          mixedItems.push({ type: "prediction", data: predictions[i] })
        }
        if (claims[i]) {
          mixedItems.push({ type: "claim", data: claims[i] })
        }
      }

      setItems(mixedItems)
    } catch (error) {
      console.error("Failed to fetch items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (itemId: string, itemType: string, vote: boolean) => {
    try {
      const endpoint =
        itemType === "prediction"
          ? `/api/predictions/${itemId}/vote`
          : `/api/claims/${itemId}/vote`

      const body = itemType === "prediction"
        ? { position: vote ? "YES" : "NO", confidence: 0.8 }
        : { voteValue: vote, confidence: 0.7 }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setVotedItems((prev) => new Set([...prev, itemId]))
      } else {
        const errorData = await res.json()
        console.error("Vote failed:", errorData)
        alert(`Failed to vote: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to vote:", error)
      alert("Failed to vote. Please try again.")
    }
  }

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      Technology: "💻",
      Business: "💼",
      Politics: "🏛️",
      Sports: "⚽",
      Health: "🏥",
      Climate: "🌍",
      Economics: "📊",
      Science: "🔬",
    }
    return emojis[category] || "📌"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
<main className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
<main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Judge Agendas</h1>
          <p className="text-slate-300">
            Vote on predictions and claims to help verify truth. Your judgments matter.
          </p>
          {!authChecking && !isAuthenticated && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                🔐 Please login to vote on agendas.{" "}
                <Link href="/login" className="underline font-semibold hover:text-blue-200">
                  Login now
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{items.length}</div>
            <div className="text-sm text-slate-400">Total Items</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{votedItems.size}</div>
            <div className="text-sm text-slate-400">Voted</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {items.length - votedItems.size}
            </div>
            <div className="text-sm text-slate-400">Remaining</div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const itemId = item.data.id
            const isVoted = votedItems.has(itemId)
            const category = item.data.category || "General"

            return (
              <div
                key={`${item.type}-${itemId}`}
                className={`bg-slate-800 border rounded-lg p-4 transition-all ${
                  isVoted
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getCategoryEmoji(category)}</span>
                      <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                        {category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.type === "prediction"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {item.type === "prediction" ? "Prediction" : "Claim"}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1 line-clamp-2">
                      {item.data.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-1">
                      {item.data.description}
                    </p>
                  </div>

                  {/* Right: Vote Buttons */}
                  <div className="flex-shrink-0">
                    {isVoted ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <span className="text-xl">✓</span>
                        <span className="text-sm font-semibold">Voted</span>
                      </div>
                    ) : !isAuthenticated ? (
                      <Link
                        href="/login"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors inline-block"
                      >
                        Login to vote
                      </Link>
                    ) : item.type === "prediction" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(itemId, item.type, true)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => handleVote(itemId, item.type, false)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(itemId, item.type, true)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
                        >
                          Agree
                        </button>
                        <button
                          onClick={() => handleVote(itemId, item.type, false)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
                        >
                          Disagree
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
            <p className="text-slate-400 text-lg">No items to judge yet</p>
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PredictionCard } from "./PredictionCard"
import { Prediction, PREDICTION_CATEGORIES } from "@/types/prediction"

export function PredictionsGrid() {
  const router = useRouter()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("open")

  useEffect(() => {
    fetchPredictions()
  }, [selectedCategory, selectedStatus])

  async function fetchPredictions() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus)
      }

      const response = await fetch(`/api/predictions?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch predictions")
      }

      const data = await response.json()
      setPredictions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  function handleVote(predictionId: string) {
    // Redirect to prediction detail page for voting
    router.push(`/predictions/${predictionId}`)
  }

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-800 rounded-xl h-64"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Failed to load predictions
        </h3>
        <p className="text-slate-400 mb-8">{error}</p>
        <button
          onClick={() => fetchPredictions()}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {PREDICTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">
            Status
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-slate-400">
          {predictions.length} {predictions.length === 1 ? "prediction" : "predictions"} found
        </p>
      </div>

      {/* Predictions Grid */}
      {predictions.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-6">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No predictions found
          </h3>
          <p className="text-slate-400 mb-8">
            Try adjusting your filters or check back later for new predictions
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  )
}

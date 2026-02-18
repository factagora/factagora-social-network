'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Footer, PredictionCard } from "@/components"
import ClaimCard from '@/components/cards/ClaimCard'
import { Prediction } from '@/types/prediction'
import { Claim } from '@/types/claim'

const CATEGORIES = [
  { id: 'politics', label: 'Politics', emoji: '🏛️', description: 'Political events, elections, and government policies' },
  { id: 'business', label: 'Business', emoji: '💼', description: 'Corporate news, markets, and economic trends' },
  { id: 'technology', label: 'Technology', emoji: '💻', description: 'Tech innovations, products, and industry developments' },
  { id: 'health', label: 'Health', emoji: '🏥', description: 'Medical research, public health, and treatments' },
  { id: 'climate', label: 'Climate', emoji: '🌍', description: 'Climate change, environment, and sustainability' },
  { id: 'sports', label: 'Sports', emoji: '⚽', description: 'Sports events, championships, and athlete performance' },
]

export default function FactBlocksPage() {
  const [allClaims, setAllClaims] = useState<Claim[]>([])
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      // Fetch all claims
      const claimResponse = await fetch('/api/claims?limit=50')
      if (claimResponse.ok) {
        const claimData = await claimResponse.json()
        setAllClaims(claimData.claims || [])
      }

      // Fetch all predictions
      const predResponse = await fetch('/api/predictions?limit=50')
      if (predResponse.ok) {
        const predData = await predResponse.json()
        setAllPredictions(predData || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFactBlocksByCategory = (categoryId: string) => {
    const blocks = [...allClaims, ...allPredictions]
      .filter((item) => {
        const category = (item.category || '').toLowerCase()
        return category === categoryId
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })

    return blocks
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <span>🧱</span>
            <span>FactBlocks</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Atomic units of truth and predictions. Each FactBlock is verified, connected, and tracked through our knowledge graph.
          </p>
        </div>

        {/* Category Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl h-48"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => {
              const blocks = getFactBlocksByCategory(category.id)
              const blockCount = blocks.length

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group"
                >
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 hover:border-blue-500/50 transition-all h-full">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{category.emoji}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {category.label}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {blockCount} FactBlocks
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4">
                      {category.description}
                    </p>

                    {/* Preview Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <span>📋</span>
                        <span>
                          {blocks.filter((b) => 'verdict' in b).length} Claims
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔮</span>
                        <span>
                          {blocks.filter((b) => !('verdict' in b)).length} Predictions
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="mt-4 text-slate-400 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                      <span className="text-sm">Explore</span>
                      <span>&gt;</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* What is FactBlock? */}
        <div className="mt-16 bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">What is a FactBlock?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-slate-300">
            <div>
              <div className="text-3xl mb-2">🧱</div>
              <h3 className="font-semibold text-white mb-2">Atomic Truth Unit</h3>
              <p className="text-sm text-slate-400">
                Each FactBlock represents a single verifiable statement or prediction. Stored in its most fundamental form.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔗</div>
              <h3 className="font-semibold text-white mb-2">Knowledge Graph</h3>
              <p className="text-sm text-slate-400">
                FactBlocks are connected through causal relationships, supporting evidence, and logical dependencies.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold text-white mb-2">Verified & Tracked</h3>
              <p className="text-sm text-slate-400">
                Every FactBlock is verified by AI agents and community, with full audit trail and confidence scores.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

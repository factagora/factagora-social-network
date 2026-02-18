'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Footer, PredictionCard, LeaderboardSidebar } from "@/components"
import ClaimCard from '@/components/cards/ClaimCard'
import { Prediction } from '@/types/prediction'
import { Claim } from '@/types/claim'

const CATEGORY_INFO: Record<string, { label: string; description: string }> = {
  politics: {
    label: 'Politics',
    description: 'Political events, elections, legislation, and government policies',
  },
  business: {
    label: 'Business',
    description: 'Corporate news, earnings, mergers, acquisitions, and market trends',
  },
  technology: {
    label: 'Technology',
    description: 'Tech products, startups, innovations, and industry developments',
  },
  health: {
    label: 'Health',
    description: 'Medical research, public health, treatments, and healthcare policy',
  },
  climate: {
    label: 'Climate',
    description: 'Climate change, environmental policy, and sustainability',
  },
  sports: {
    label: 'Sports',
    description: 'Sports events, championships, records, and athlete performance',
  },
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const categoryInfo = CATEGORY_INFO[category]

  const [claims, setClaims] = useState<Claim[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [category])

  async function fetchData() {
    setIsLoading(true)
    try {
      // Fetch claims
      const claimResponse = await fetch(`/api/claims?category=${category}&limit=20`)
      if (claimResponse.ok) {
        const claimData = await claimResponse.json()
        setClaims(claimData.claims || [])
      }

      // Fetch predictions
      const predResponse = await fetch(`/api/predictions?category=${category}&limit=20`)
      if (predResponse.ok) {
        const predData = await predResponse.json()
        setPredictions(predData || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
<main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const allPosts = [...claims, ...predictions].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm">
            ← Back to Home
          </Link>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{categoryInfo.label}</h1>
              <p className="text-lg text-slate-400">{categoryInfo.description}</p>
            </div>

            {/* Create Buttons */}
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/predictions/new?category=${category}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <span>+</span>
                <span className="hidden sm:inline">New Prediction</span>
                <span className="sm:hidden">Prediction</span>
              </Link>
              <Link
                href={`/claims/new?category=${category}`}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <span>+</span>
                <span className="hidden sm:inline">New Claim</span>
                <span className="sm:hidden">Claim</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Posts */}
          <main className="col-span-12 lg:col-span-8">
            {isLoading ? (
              // Loading skeleton
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg h-32"></div>
                  </div>
                ))}
              </div>
            ) : allPosts.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <p className="text-slate-400">No posts in this category yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {allPosts.map((item) => {
                  if ('verdict' in item) {
                    return <ClaimCard key={`claim-${item.id}`} claim={item as Claim} />
                  } else {
                    return (
                      <PredictionCard
                        key={`pred-${item.id}`}
                        prediction={item as Prediction}
                        onVote={(id) => (window.location.href = `/predictions/${id}`)}
                      />
                    )
                  }
                })}
              </div>
            )}
          </main>

          {/* Right Column: Leaderboard */}
          <aside className="hidden lg:block lg:col-span-4">
            <LeaderboardSidebar />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

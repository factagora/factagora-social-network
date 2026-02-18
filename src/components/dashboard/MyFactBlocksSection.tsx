"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface FactBlock {
  id: string
  type: 'prediction' | 'claim'
  title: string
  description: string | null
  category: string | null
  status: 'active' | 'resolved' | 'deadline_passed' | 'verified' | 'rejected'
  createdAt: string
  updatedAt: string
  activity: {
    totalArguments: number
    newArguments: number
    lastActivityAt: string
  }
  consensus?: {
    yesPercentage: number
    noPercentage: number
    totalVotes: number
  }
  deadline?: string
  resolutionValue?: boolean | null
  verdict?: 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIABLE' | null
}

export function MyFactBlocksSection() {
  const [factBlocks, setFactBlocks] = useState<FactBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'predictions' | 'claims'>('all')
  const [stats, setStats] = useState({ total: 0, predictions: 0, claims: 0 })

  useEffect(() => {
    fetchMyFactBlocks()
  }, [])

  async function fetchMyFactBlocks() {
    try {
      const response = await fetch('/api/factblocks/mine')
      if (response.ok) {
        const data = await response.json()
        setFactBlocks(data.factBlocks || [])
        setStats({
          total: data.total || 0,
          predictions: data.predictions || 0,
          claims: data.claims || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch my factblocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diff = now - then

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getStatusBadge = (block: FactBlock) => {
    if (block.status === 'resolved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium border border-emerald-500/20">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {block.resolutionValue ? "Resolved: TRUE" : "Resolved: FALSE"}
        </span>
      )
    }

    if (block.status === 'verified') {
      const color = block.verdict === 'TRUE' ? 'emerald' : block.verdict === 'FALSE' ? 'red' : 'yellow'
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-${color}-500/10 text-${color}-400 rounded text-xs font-medium border border-${color}-500/20`}>
          {block.verdict}
        </span>
      )
    }

    if (block.status === 'deadline_passed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/10 text-slate-400 rounded text-xs font-medium border border-slate-500/20">
          Deadline Passed
        </span>
      )
    }

    if (block.status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs font-medium border border-red-500/20">
          Rejected
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-medium border border-blue-500/20">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
        Active
      </span>
    )
  }

  const getUrl = (block: FactBlock) => {
    return block.type === 'prediction'
      ? `/predictions/${block.id}`
      : `/claims/${block.id}`
  }

  const filteredBlocks = factBlocks.filter(block => {
    if (filter === 'all') return true
    if (filter === 'predictions') return block.type === 'prediction'
    if (filter === 'claims') return block.type === 'claim'
    return true
  })

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">My FactBlocks</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900/50 border border-slate-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </section>
    )
  }

  if (factBlocks.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">My FactBlocks</h2>
        <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-lg text-center">
          <div className="max-w-sm mx-auto">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400 text-sm mb-4">No predictions or claims yet</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/predictions/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Create Prediction
              </Link>
              <Link
                href="/claims/create"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                Create Claim
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      {/* Header with Filter Pills */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">My FactBlocks</h2>
          <span className="text-sm text-slate-500">
            {filteredBlocks.length} item{filteredBlocks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('predictions')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'predictions'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Predictions ({stats.predictions})
          </button>
          <button
            onClick={() => setFilter('claims')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'claims'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Claims ({stats.claims})
          </button>
        </div>
      </div>

      {/* FactBlocks List */}
      <div className="space-y-3">
        {filteredBlocks.map((block) => (
          <Link
            key={`${block.type}-${block.id}`}
            href={getUrl(block)}
            className="block p-4 bg-slate-900/30 border border-slate-800 rounded-lg hover:bg-slate-900/50 hover:border-slate-700 transition-all duration-150 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title & Type Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    block.type === 'prediction'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {block.type === 'prediction' ? 'Prediction' : 'Claim'}
                  </span>
                  {getStatusBadge(block)}
                  {block.activity.newArguments > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs font-medium border border-orange-500/20">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
                      {block.activity.newArguments} new
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                  {block.title}
                </h3>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{block.activity.totalArguments}</span>
                  </div>

                  {block.type === 'prediction' && block.consensus && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>{block.consensus.yesPercentage}% YES</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{getTimeAgo(block.activity.lastActivityAt)}</span>
                  </div>
                </div>
              </div>

              {/* Arrow Icon */}
              <div className="text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

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

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getTypeBadge = (type: 'prediction' | 'claim') => {
    if (type === 'prediction') {
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
          Prediction
        </span>
      )
    }
    return (
      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
        Claim
      </span>
    )
  }

  const getStatusBadge = (block: FactBlock) => {
    if (block.status === 'resolved') {
      return (
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
          ✅ Resolved: {block.resolutionValue ? "TRUE" : "FALSE"}
        </span>
      )
    }

    if (block.status === 'verified') {
      const verdictEmoji = block.verdict === 'TRUE' ? '✅' : block.verdict === 'FALSE' ? '❌' : '⚠️'
      return (
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
          {verdictEmoji} {block.verdict}
        </span>
      )
    }

    if (block.status === 'deadline_passed') {
      return (
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
          Deadline Passed
        </span>
      )
    }

    if (block.status === 'rejected') {
      return (
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
          Rejected
        </span>
      )
    }

    return (
      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
        🟢 Active
      </span>
    )
  }

  const getUrl = (block: FactBlock) => {
    return block.type === 'prediction'
      ? `/predictions/${block.id}`
      : `/claims/${block.id}`
  }

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">📊 My FactBlocks</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-800/50 border border-slate-700 rounded-xl"></div>
          ))}
        </div>
      </section>
    )
  }

  if (factBlocks.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">📊 My FactBlocks</h2>
        <div className="p-8 bg-slate-800/30 border border-slate-700 rounded-xl text-center">
          <p className="text-slate-400 mb-4">You haven't created any predictions or claims yet</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/predictions/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Create Prediction
            </Link>
            <Link
              href="/claims/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            >
              Create Claim
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const activeBlocks = factBlocks.filter(b => b.status === 'active')
  const resolvedBlocks = factBlocks.filter(b => b.status === 'resolved' || b.status === 'verified')

  return (
    <section className="mb-12">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">📊 My FactBlocks</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1 bg-slate-700/50 rounded-lg">
            <span className="text-slate-400">Total: </span>
            <span className="text-white font-semibold">{stats.total}</span>
          </div>
          <div className="px-3 py-1 bg-blue-500/20 rounded-lg">
            <span className="text-blue-400">Predictions: </span>
            <span className="text-white font-semibold">{stats.predictions}</span>
          </div>
          <div className="px-3 py-1 bg-purple-500/20 rounded-lg">
            <span className="text-purple-400">Claims: </span>
            <span className="text-white font-semibold">{stats.claims}</span>
          </div>
          <div className="px-3 py-1 bg-green-500/20 rounded-lg">
            <span className="text-green-400">Active: </span>
            <span className="text-white font-semibold">{activeBlocks.length}</span>
          </div>
        </div>
      </div>

      {/* FactBlocks List */}
      <div className="space-y-4">
        {factBlocks.map((block) => (
          <Link
            key={`${block.type}-${block.id}`}
            href={getUrl(block)}
            className="block p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title, Type & Status */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {getTypeBadge(block.type)}
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {block.title}
                  </h3>
                  {getStatusBadge(block)}
                </div>

                {/* Activity Info */}
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  {/* New Activity Highlight */}
                  {block.activity.newArguments > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full font-semibold">
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                      {block.activity.newArguments} new {block.type === 'prediction' ? 'argument' : 'verification'}{block.activity.newArguments !== 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Total Arguments/Verifications */}
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>💬</span>
                    <span>
                      {block.activity.totalArguments} {block.type === 'prediction' ? 'argument' : 'verification'}{block.activity.totalArguments !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Consensus (Predictions only) */}
                  {block.type === 'prediction' && block.consensus && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>📊</span>
                      <span>{block.consensus.yesPercentage}% YES</span>
                    </div>
                  )}

                  {/* Last Activity */}
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>•</span>
                    <span>Updated {getTimeAgo(block.activity.lastActivityAt)}</span>
                  </div>
                </div>
              </div>

              {/* Arrow Icon */}
              <div className="text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {factBlocks.length > 5 && (
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/predictions?filter=mine"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              View All Predictions →
            </Link>
            <span className="text-slate-600">|</span>
            <Link
              href="/claims?filter=mine"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              View All Claims →
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

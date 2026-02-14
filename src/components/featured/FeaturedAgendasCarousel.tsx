'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FeaturedAgenda {
  id: string
  type: 'prediction' | 'claim'
  title: string
  description?: string
  category: string | null
  imageUrl?: string
  stats: {
    consensus: number
    trend24h: number
    agentCount: number
    avgConfidence: number
    argumentCount: number
    totalVotes: number
  }
}

interface FeaturedAgendasCarouselProps {
  agendas: FeaturedAgenda[]
}

// Category colors matching Kalshi style
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; cardBg: string }> = {
  technology: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', cardBg: 'from-blue-600/20 to-blue-900/20' },
  politics: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', cardBg: 'from-purple-600/20 to-purple-900/20' },
  business: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', cardBg: 'from-orange-600/20 to-orange-900/20' },
  sports: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', cardBg: 'from-green-600/20 to-green-900/20' },
  health: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', cardBg: 'from-cyan-600/20 to-cyan-900/20' },
  climate: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/50', cardBg: 'from-teal-600/20 to-teal-900/20' },
  tech: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', cardBg: 'from-blue-600/20 to-blue-900/20' },
  science: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', cardBg: 'from-cyan-600/20 to-cyan-900/20' },
  economics: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', cardBg: 'from-yellow-600/20 to-yellow-900/20' },
  entertainment: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50', cardBg: 'from-pink-600/20 to-pink-900/20' },
}

export function FeaturedAgendasCarousel({ agendas }: FeaturedAgendasCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!agendas || agendas.length === 0) {
    return null
  }

  const currentAgenda = agendas[currentIndex]
  const categoryColor = CATEGORY_COLORS[currentAgenda.category?.toLowerCase() || ''] || {
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    border: 'border-slate-500/50',
    cardBg: 'from-slate-600/20 to-slate-900/20'
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? agendas.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === agendas.length - 1 ? 0 : prev + 1))
  }

  const href = currentAgenda.type === 'prediction'
    ? `/predictions/${currentAgenda.id}`
    : `/claims/${currentAgenda.id}`

  // Determine if trend is positive or negative
  const trendIcon = currentAgenda.stats.trend24h > 0 ? '↑' : currentAgenda.stats.trend24h < 0 ? '↓' : '→'
  const trendColor = currentAgenda.stats.trend24h > 0 ? 'text-green-400' : currentAgenda.stats.trend24h < 0 ? 'text-red-400' : 'text-slate-400'

  // Get emoji for category
  const getCategoryEmoji = (category: string | null) => {
    if (!category) return '🎯'
    const lowerCategory = category.toLowerCase()
    const emojiMap: Record<string, string> = {
      technology: '💻',
      tech: '💻',
      politics: '🏛️',
      business: '💼',
      sports: '⚽',
      health: '🏥',
      climate: '🌍',
      science: '🔬',
      economics: '📈',
      entertainment: '🎬'
    }
    return emojiMap[lowerCategory] || '🎯'
  }

  return (
    <div className="relative">
      {/* Main Featured Card - Large, Full Width */}
      <div className={`relative bg-gradient-to-br ${categoryColor.cardBg} border ${categoryColor.border} rounded-3xl overflow-hidden shadow-2xl`}>
        {/* Header Image Section - Only show if imageUrl exists */}
        {currentAgenda.imageUrl && (
          <div className="relative h-80 md:h-96">
            <img
              src={currentAgenda.imageUrl}
              alt={currentAgenda.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-8 md:p-12">
          {/* Top Bar: Badges + Navigation */}
          <div className="flex items-start justify-between mb-6">
            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Badge */}
              {currentAgenda.category && (
                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} border`}>
                  {currentAgenda.category.charAt(0).toUpperCase() + currentAgenda.category.slice(1)}
                </span>
              )}

              {/* Type Badge */}
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
                {currentAgenda.type === 'prediction' ? '🔮 Prediction' : '✅ Fact-Check'}
              </span>
            </div>

            {/* Navigation Controls - Top Right (Kalshi Style) */}
            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 border border-slate-700/50 flex-shrink-0">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-slate-700/80 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Previous agenda"
              >
                <svg className="w-5 h-5 text-slate-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Counter */}
              <div className="px-3 text-sm font-semibold text-slate-300">
                {currentIndex + 1}/{agendas.length}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="p-2 hover:bg-slate-700/80 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Next agenda"
              >
                <svg className="w-5 h-5 text-slate-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            {currentAgenda.title}
          </h2>

          {/* Description (if available) */}
          {currentAgenda.description && (
            <p className="text-lg text-slate-300 mb-8 leading-relaxed line-clamp-3">
              {currentAgenda.description}
            </p>
          )}

          {/* Stats Grid - Large and Prominent */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {/* Consensus */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-2 font-medium">Current Consensus</div>
              <div className="text-4xl font-bold text-white mb-2">
                {Math.round(currentAgenda.stats.consensus)}%
              </div>
              <div className={`text-sm font-semibold ${trendColor} flex items-center gap-1`}>
                <span className="text-lg">{trendIcon}</span>
                {Math.abs(currentAgenda.stats.trend24h)}% (24h)
              </div>
            </div>

            {/* AI Agents */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-2 font-medium">AI Agents</div>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {currentAgenda.stats.agentCount}
              </div>
              <div className="text-sm text-slate-400">
                Avg Confidence: {Math.round(currentAgenda.stats.avgConfidence)}%
              </div>
            </div>

            {/* Total Votes */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-2 font-medium">Total Votes</div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {currentAgenda.stats.totalVotes}
              </div>
              <div className="text-sm text-slate-400">
                Community Participation
              </div>
            </div>

            {/* Arguments */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-2 font-medium">Arguments</div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {currentAgenda.stats.argumentCount}
              </div>
              <div className="text-sm text-slate-400">
                Evidence & Reasoning
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
          >
            View Full Details
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>

      {/* Indicator Dots - Bottom Center */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {agendas.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-blue-500'
                : 'w-2 bg-slate-700 hover:bg-slate-600'
            }`}
            aria-label={`Go to agenda ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

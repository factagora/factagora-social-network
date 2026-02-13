'use client'

import { getCredibilityColor, getCredibilityLabel } from '@/types/credibility'

interface CredibilityBadgeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showScore?: boolean
}

export function CredibilityBadge({
  score,
  size = 'md',
  showLabel = true,
  showScore = true
}: CredibilityBadgeProps) {
  const colorClass = getCredibilityColor(score)
  const label = getCredibilityLabel(score)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  // Get icon based on score
  const getIcon = () => {
    if (score >= 80) return '✓'
    if (score >= 60) return '≈'
    if (score >= 40) return '?'
    return '✗'
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg font-semibold border ${colorClass} ${sizeClasses[size]}`}
      title={`Credibility: ${score}/100 - ${label}`}
    >
      <span className={iconSize[size]}>{getIcon()}</span>
      {showLabel && <span>{label}</span>}
      {showScore && (
        <span className="opacity-80">
          {score}/100
        </span>
      )}
    </div>
  )
}

interface SourceReputationBadgeProps {
  domain: string
  credibilityScore: number
  sourceName?: string | null
  sourceType?: string | null
  compact?: boolean
}

export function SourceReputationBadge({
  domain,
  credibilityScore,
  sourceName,
  sourceType,
  compact = false
}: SourceReputationBadgeProps) {
  const colorClass = getCredibilityColor(credibilityScore)

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${colorClass}`}>
        <span>🔗</span>
        <span>{domain}</span>
        <span className="opacity-80">{credibilityScore}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass}`}>
      <span className="text-2xl">🔗</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {sourceName || domain}
        </div>
        <div className="text-xs opacity-70 truncate">{domain}</div>
        {sourceType && (
          <div className="text-xs opacity-60 mt-1">
            {sourceType.replace('_', ' ')}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end">
        <div className="font-bold text-lg">{credibilityScore}</div>
        <div className="text-xs opacity-70">credibility</div>
      </div>
    </div>
  )
}

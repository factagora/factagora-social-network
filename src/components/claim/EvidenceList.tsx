'use client'

import { useState, useEffect } from 'react'
import { Evidence } from '@/types/claim'

interface EvidenceListProps {
  claimId: string
}

export default function EvidenceList({ claimId }: EvidenceListProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvidence()
  }, [claimId])

  async function fetchEvidence() {
    try {
      const res = await fetch(`/api/claims/${claimId}/evidence`)
      if (res.ok) {
        const data = await res.json()
        setEvidence(data.evidence || [])
      }
    } catch (error) {
      console.error('Error fetching evidence:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVote(evidenceId: string, voteType: 'HELPFUL' | 'UNHELPFUL') {
    try {
      const res = await fetch(
        `/api/claims/${claimId}/evidence/${evidenceId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voteType }),
        }
      )

      if (res.ok) {
        // Refresh evidence list
        fetchEvidence()
      }
    } catch (error) {
      console.error('Error voting on evidence:', error)
    }
  }

  const getSourceTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      OFFICIAL_DOCUMENT: '📄',
      NEWS_ARTICLE: '📰',
      RESEARCH_PAPER: '📚',
      STATISTICS: '📊',
      VIDEO: '🎥',
      SOCIAL_MEDIA: '💬',
      EXPERT_TESTIMONY: '👨‍🏫',
      OTHER: '📎',
    }
    return icons[type] || '📎'
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Loading evidence...</p>
      </div>
    )
  }

  if (evidence.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-800/30 border border-slate-700/50 rounded-lg">
        <p className="text-slate-400">No evidence submitted yet.</p>
        <p className="text-sm text-slate-500 mt-2">
          Be the first to submit evidence!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {evidence.map((ev) => (
        <div
          key={ev.id}
          className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl">{getSourceTypeIcon(ev.sourceType)}</span>
              <div className="flex-1">
                <h4 className="text-slate-200 font-medium mb-1">{ev.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{ev.sourceType.replace(/_/g, ' ')}</span>
                  {ev.publisher && (
                    <>
                      <span>•</span>
                      <span>{ev.publisher}</span>
                    </>
                  )}
                  {ev.publishedDate && (
                    <>
                      <span>•</span>
                      <span>
                        {new Date(ev.publishedDate).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Credibility Score */}
            {ev.credibilityScore && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">Credibility:</span>
                <span className="text-sm font-bold text-green-400">
                  {Math.round(ev.credibilityScore * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {ev.description && (
            <p className="text-sm text-slate-400 mb-3">{ev.description}</p>
          )}

          {/* URL */}
          <a
            href={ev.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3"
          >
            View source →
          </a>

          {/* Footer with voting */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleVote(ev.id, 'HELPFUL')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-400 transition-colors"
              >
                <span>👍</span>
                <span>{ev.helpfulVotes}</span>
              </button>
              <button
                onClick={() => handleVote(ev.id, 'UNHELPFUL')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                <span>👎</span>
                <span>{ev.unhelpfulVotes}</span>
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Submitted by{' '}
              {ev.submissionType === 'AI_AGENT' ? (
                <span className="text-purple-400">AI Agent</span>
              ) : (
                'Community'
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

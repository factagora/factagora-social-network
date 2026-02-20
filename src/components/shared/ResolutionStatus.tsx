'use client'

import { useState, type ReactNode } from 'react'

interface ResolutionStatusProps {
  entityId: string
  entityLabel?: string
  resolutionDate: string | null
  isCreator: boolean
  isResolved: boolean
  resolutionValue?: boolean | string | null
  verdict?: string | null
  title?: string
  onResolve?: () => void
  renderDialog?: (props: { onClose: () => void; onResolved: () => void }) => ReactNode
}

const VERDICT_MAP: Record<string, { icon: string; text: string }> = {
  TRUE: { icon: '✅', text: 'TRUE' },
  FALSE: { icon: '❌', text: 'FALSE' },
  PARTIALLY_TRUE: { icon: '⚠️', text: 'PARTIALLY TRUE' },
  UNVERIFIED: { icon: '❓', text: 'UNVERIFIED' },
  MISLEADING: { icon: '⚠️', text: 'MISLEADING' },
}

function getVerdictDisplay(
  verdict: string | null | undefined,
  resolutionValue: boolean | string | null | undefined
) {
  if (verdict && VERDICT_MAP[verdict]) return VERDICT_MAP[verdict]
  if (resolutionValue !== null && resolutionValue !== undefined) {
    if (typeof resolutionValue === 'string') return { icon: '✅', text: resolutionValue }
    return resolutionValue
      ? { icon: '✅', text: 'TRUE' }
      : { icon: '❌', text: 'FALSE' }
  }
  return null
}

export function ResolutionStatus({
  entityLabel = 'claim',
  resolutionDate,
  isCreator,
  isResolved,
  resolutionValue,
  verdict,
  onResolve,
  renderDialog,
}: ResolutionStatusProps) {
  const [showModal, setShowModal] = useState(false)

  const resolutionDateObj = resolutionDate ? new Date(resolutionDate) : null
  const now = new Date()
  const canResolve =
    resolutionDateObj && now >= resolutionDateObj && !isResolved && isCreator

  const handleResolved = () => {
    setShowModal(false)
    onResolve?.()
    window.location.reload()
  }

  const daysRemaining = resolutionDateObj
    ? Math.ceil((resolutionDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Already resolved
  if (isResolved) {
    const v = getVerdictDisplay(verdict, resolutionValue)
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
        <span>{v?.icon || '✅'}</span>
        <span className="text-blue-300 font-semibold">Resolved: {v?.text || 'RESOLVED'}</span>
      </div>
    )
  }

  // Not the creator — awaiting
  if (!isCreator) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/40 border border-slate-600/50 rounded-lg text-sm">
        <span>⏳</span>
        <span className="text-slate-300 font-medium">Awaiting Resolution</span>
        {resolutionDateObj && now < resolutionDateObj && (
          <span className="text-slate-500">
            · resolves after {resolutionDateObj.toLocaleDateString()}
          </span>
        )}
      </div>
    )
  }

  // Creator but can't resolve yet
  if (!canResolve) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/40 border border-slate-600/50 rounded-lg text-sm">
        <span>📅</span>
        <span className="text-slate-300 font-medium">
          Resolves after {resolutionDateObj?.toLocaleDateString() || 'N/A'}
        </span>
        {daysRemaining != null && daysRemaining > 0 && (
          <span className="text-slate-500">· {daysRemaining}d remaining</span>
        )}
      </div>
    )
  }

  // Creator can resolve now
  const label = entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)
  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
        <span>🎯</span>
        <span className="text-blue-300 font-medium">Ready to resolve</span>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition-colors"
        >
          Resolve {label}
        </button>
      </div>

      {showModal &&
        renderDialog?.({
          onClose: () => setShowModal(false),
          onResolved: handleResolved,
        })}
    </>
  )
}

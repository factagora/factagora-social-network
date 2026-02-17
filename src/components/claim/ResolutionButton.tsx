'use client'

import { useState } from 'react'
import { ResolveClaimDialog } from '@/components/resolution'

interface ResolutionButtonProps {
  claimId: string
  resolutionDate: string | null
  isCreator: boolean
  isResolved: boolean
  resolutionValue?: boolean | null
  verdict?: string | null
  title?: string
  onResolve?: () => void
}

export default function ResolutionButton({
  claimId,
  resolutionDate,
  isCreator,
  isResolved,
  resolutionValue,
  verdict,
  title = 'Claim',
  onResolve,
}: ResolutionButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const resolutionDateObj = resolutionDate ? new Date(resolutionDate) : null
  const now = new Date()
  const canResolve = resolutionDateObj && now >= resolutionDateObj && !isResolved && isCreator

  const handleResolved = () => {
    setShowModal(false)
    if (onResolve) {
      onResolve()
    }
    // Reload page to show updated status
    window.location.reload()
  }

  // Helper function to get verdict display
  const getVerdictDisplay = () => {
    if (verdict) {
      const verdictMap: Record<string, { icon: string; text: string }> = {
        'TRUE': { icon: '✅', text: 'TRUE' },
        'FALSE': { icon: '❌', text: 'FALSE' },
        'PARTIALLY_TRUE': { icon: '⚠️', text: 'PARTIALLY TRUE' },
        'UNVERIFIABLE': { icon: '❓', text: 'UNVERIFIABLE' },
      }
      return verdictMap[verdict] || { icon: '✅', text: verdict }
    }
    // Fallback to old resolutionValue for backwards compatibility
    if (resolutionValue !== null && resolutionValue !== undefined) {
      return resolutionValue ? { icon: '✅', text: 'TRUE' } : { icon: '❌', text: 'FALSE' }
    }
    return null
  }

  // Already resolved
  if (isResolved) {
    const verdictDisplay = getVerdictDisplay()
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">
            {verdictDisplay?.icon || '✅'}
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            Resolved as {verdictDisplay?.text || 'RESOLVED'}
          </h3>
          <p className="text-slate-400 text-sm">
            This claim has been resolved by the creator
          </p>
        </div>
      </div>
    )
  }

  // Not the creator
  if (!isCreator) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <div className="text-center">
          <div className="text-3xl mb-3">⏳</div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            Awaiting Resolution
          </h3>
          <p className="text-slate-400 text-sm">
            {resolutionDateObj && now < resolutionDateObj ? (
              <>
                Can be resolved after{' '}
                <span className="font-medium text-slate-300">
                  {resolutionDateObj.toLocaleDateString()}
                </span>
              </>
            ) : (
              'Only the claim creator can resolve this'
            )}
          </p>
        </div>
      </div>
    )
  }

  // Creator but can't resolve yet
  if (!canResolve) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <div className="text-center">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            Not Ready for Resolution
          </h3>
          <p className="text-slate-400 text-sm">
            You can resolve this claim after{' '}
            <span className="font-medium text-slate-300">
              {resolutionDateObj?.toLocaleDateString() || 'N/A'}
            </span>
          </p>
          {resolutionDateObj && (
            <p className="text-xs text-slate-500 mt-2">
              {Math.ceil((resolutionDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}{' '}
              days remaining
            </p>
          )}
        </div>
      </div>
    )
  }

  // Creator can resolve
  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <div className="text-center mb-4">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            Ready to Resolve
          </h3>
          <p className="text-slate-400 text-sm">
            As the creator, you can now resolve this claim
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
        >
          Resolve Claim
        </button>
      </div>

      {/* Resolution Dialog */}
      {showModal && (
        <ResolveClaimDialog
          claimId={claimId}
          title={title}
          onClose={() => setShowModal(false)}
          onResolved={handleResolved}
        />
      )}
    </>
  )
}

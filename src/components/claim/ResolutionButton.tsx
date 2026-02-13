'use client'

import { useState } from 'react'

interface ResolutionButtonProps {
  claimId: string
  resolutionDate: string | null
  isCreator: boolean
  isResolved: boolean
  resolutionValue?: boolean | null
  onResolve?: () => void
}

export default function ResolutionButton({
  claimId,
  resolutionDate,
  isCreator,
  isResolved,
  resolutionValue,
  onResolve,
}: ResolutionButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedValue, setSelectedValue] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolutionDateObj = resolutionDate ? new Date(resolutionDate) : null
  const now = new Date()
  const canResolve = resolutionDateObj && now >= resolutionDateObj && !isResolved && isCreator

  async function handleResolve() {
    if (selectedValue === null) {
      setError('Please select TRUE or FALSE')
      return
    }

    if (!confirm(`Are you sure you want to resolve this claim as ${selectedValue ? 'TRUE' : 'FALSE'}? This action cannot be undone.`)) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/claims/${claimId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionValue: selectedValue }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resolve claim')
      }

      setShowModal(false)
      if (onResolve) {
        onResolve()
      }
      // Reload page to show updated status
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Already resolved
  if (isResolved) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">
            {resolutionValue ? '✅' : '❌'}
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            Resolved as {resolutionValue ? 'TRUE' : 'FALSE'}
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

      {/* Resolution Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              Resolve Claim
            </h3>

            <p className="text-sm text-slate-400 mb-6">
              Based on the evidence and arguments, what is the final verdict for this claim?
            </p>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Resolution Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setSelectedValue(true)}
                className={`py-4 rounded-lg font-bold text-lg transition-all ${
                  selectedValue === true
                    ? 'bg-green-600 text-white border-2 border-green-400'
                    : 'bg-slate-900/50 text-slate-300 border border-slate-600 hover:border-green-500'
                }`}
              >
                ✓ TRUE
              </button>

              <button
                onClick={() => setSelectedValue(false)}
                className={`py-4 rounded-lg font-bold text-lg transition-all ${
                  selectedValue === false
                    ? 'bg-red-600 text-white border-2 border-red-400'
                    : 'bg-slate-900/50 text-slate-300 border border-slate-600 hover:border-red-500'
                }`}
              >
                ✗ FALSE
              </button>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-yellow-400 text-sm font-medium mb-1">
                    Important
                  </p>
                  <p className="text-slate-400 text-xs">
                    This action cannot be undone. The resolution will be permanent
                    and will determine rewards for voters.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedValue(null)
                  setError(null)
                }}
                disabled={isSubmitting}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={isSubmitting || selectedValue === null}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

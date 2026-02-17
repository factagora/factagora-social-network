"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Verdict = 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIABLE'

interface ResolveClaimDialogProps {
  claimId: string
  title: string
  onClose: () => void
  onResolved: () => void
}

const VERDICT_OPTIONS: Array<{
  value: Verdict
  label: string
  description: string
  color: string
  icon: string
}> = [
  {
    value: 'TRUE',
    label: 'TRUE',
    description: 'The claim is factually correct',
    color: 'green',
    icon: '✅',
  },
  {
    value: 'FALSE',
    label: 'FALSE',
    description: 'The claim is factually incorrect',
    color: 'red',
    icon: '❌',
  },
  {
    value: 'PARTIALLY_TRUE',
    label: 'PARTIALLY TRUE',
    description: 'The claim is partially correct',
    color: 'yellow',
    icon: '⚠️',
  },
  {
    value: 'UNVERIFIABLE',
    label: 'UNVERIFIABLE',
    description: 'The claim cannot be verified',
    color: 'gray',
    icon: '❓',
  },
]

export function ResolveClaimDialog({
  claimId,
  title,
  onClose,
  onResolved,
}: ResolveClaimDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict | null>(null)

  const handleSubmit = async () => {
    if (!selectedVerdict) {
      setError("Please select a verdict")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/claims/${claimId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict: selectedVerdict }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve claim')
      }

      onResolved()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVerdictStyles = (color: string, isSelected: boolean) => {
    const colors = {
      green: isSelected
        ? 'border-green-500 bg-green-500/20 text-green-400'
        : 'border-slate-600 hover:border-green-500/50',
      red: isSelected
        ? 'border-red-500 bg-red-500/20 text-red-400'
        : 'border-slate-600 hover:border-red-500/50',
      yellow: isSelected
        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
        : 'border-slate-600 hover:border-yellow-500/50',
      gray: isSelected
        ? 'border-slate-500 bg-slate-500/20 text-slate-400'
        : 'border-slate-600 hover:border-slate-500/50',
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Resolve Claim</h2>
          <p className="text-slate-300 text-sm">{title}</p>
        </div>

        {/* Verdict Selection */}
        <div className="mb-6 space-y-3">
          <p className="text-slate-400 text-sm mb-3">Select the verdict:</p>
          {VERDICT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedVerdict(option.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                getVerdictStyles(option.color, selectedVerdict === option.value)
              } ${!selectedVerdict || selectedVerdict !== option.value ? 'text-slate-300' : ''}`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">{option.icon}</span>
                <span className="text-lg font-semibold">{option.label}</span>
              </div>
              <div className="text-sm opacity-75 ml-8">{option.description}</div>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedVerdict}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
          >
            {isSubmitting ? 'Resolving...' : 'Resolve'}
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ResolvePredictionDialogProps {
  predictionId: string
  predictionType: 'BINARY' | 'MULTIPLE_CHOICE' | 'NUMERIC' | 'RANGE' | 'TIMESERIES'
  title: string
  onClose: () => void
  onResolved: () => void
}

export function ResolvePredictionDialog({
  predictionId,
  predictionType,
  title,
  onClose,
  onResolved,
}: ResolvePredictionDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // For BINARY
  const [binaryValue, setBinaryValue] = useState<boolean | null>(null)
  
  // For NUMERIC/RANGE/TIMESERIES
  const [numericValue, setNumericValue] = useState<string>("")

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      let resolutionValue: boolean | number

      if (predictionType === 'BINARY') {
        if (binaryValue === null) {
          setError("Please select YES or NO")
          setIsSubmitting(false)
          return
        }
        resolutionValue = binaryValue
      } else {
        // NUMERIC, RANGE, TIMESERIES
        const parsed = parseFloat(numericValue)
        if (isNaN(parsed)) {
          setError("Please enter a valid number")
          setIsSubmitting(false)
          return
        }
        resolutionValue = parsed
      }

      const response = await fetch(`/api/predictions/${predictionId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve prediction')
      }

      onResolved()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Resolve Prediction</h2>
          <p className="text-slate-300 text-sm">{title}</p>
        </div>

        {/* Resolution Input */}
        <div className="mb-6">
          {predictionType === 'BINARY' ? (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm mb-3">Select the actual outcome:</p>
              <button
                onClick={() => setBinaryValue(true)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  binaryValue === true
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-slate-600 hover:border-green-500/50 text-slate-300'
                }`}
              >
                <div className="text-lg font-semibold">✅ YES / TRUE</div>
                <div className="text-sm opacity-75">The prediction came true</div>
              </button>
              <button
                onClick={() => setBinaryValue(false)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  binaryValue === false
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-slate-600 hover:border-red-500/50 text-slate-300'
                }`}
              >
                <div className="text-lg font-semibold">❌ NO / FALSE</div>
                <div className="text-sm opacity-75">The prediction did not come true</div>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-slate-400 text-sm mb-2">
                Enter the actual value:
              </label>
              <input
                type="number"
                step="any"
                value={numericValue}
                onChange={(e) => setNumericValue(e.target.value)}
                placeholder="Enter numeric value"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-slate-500 text-xs">
                {predictionType === 'TIMESERIES' && "Enter the actual value at the deadline"}
                {predictionType === 'NUMERIC' && "Enter the actual numeric value"}
                {predictionType === 'RANGE' && "Enter the actual value within range"}
              </p>
            </div>
          )}
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
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
          >
            {isSubmitting ? 'Resolving...' : 'Resolve'}
          </button>
        </div>
      </div>
    </div>
  )
}

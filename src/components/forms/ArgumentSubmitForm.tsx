'use client'

import { useState } from 'react'
import type { ClaimArgumentInput, ArgumentPosition } from '@/types/claim'

interface ArgumentSubmitFormProps {
  claimId: string
  onSuccess?: () => void
}

export default function ArgumentSubmitForm({
  claimId,
  onSuccess,
}: ArgumentSubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState<ClaimArgumentInput>({
    position: 'TRUE',
    content: '',
    reasoning: '',
    confidence: 0.7,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/claims/${claimId}/arguments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit argument')
      }

      // Reset form
      setFormData({
        position: 'TRUE',
        content: '',
        reasoning: '',
        confidence: 0.7,
      })
      setShowForm(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        + Add Argument
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-4 mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-100">Add Your Argument</h3>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-slate-400 hover:text-slate-300"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your Position <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['TRUE', 'FALSE', 'UNCERTAIN'] as ArgumentPosition[]).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setFormData({ ...formData, position: pos })}
              className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                formData.position === pos
                  ? pos === 'TRUE'
                    ? 'bg-green-600 text-white border-2 border-green-400'
                    : pos === 'FALSE'
                    ? 'bg-red-600 text-white border-2 border-red-400'
                    : 'bg-yellow-600 text-white border-2 border-yellow-400'
                  : 'bg-slate-900/50 text-slate-300 border border-slate-600'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Argument <span className="text-red-400">*</span>
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="State your argument clearly and concisely..."
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          rows={4}
          required
          minLength={50}
          maxLength={5000}
        />
        <p className="text-xs text-slate-500 mt-1">
          {formData.content.length}/5000 characters (min 50)
        </p>
      </div>

      {/* Reasoning */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Reasoning (Optional)
        </label>
        <textarea
          name="reasoning"
          value={formData.reasoning}
          onChange={handleChange}
          placeholder="Explain your reasoning..."
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          rows={3}
          maxLength={2000}
        />
      </div>

      {/* Confidence */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Confidence: {Math.round((formData.confidence || 0.7) * 100)}%
        </label>
        <input
          type="range"
          name="confidence"
          min="0.5"
          max="1"
          step="0.05"
          value={formData.confidence}
          onChange={(e) =>
            setFormData({ ...formData, confidence: parseFloat(e.target.value) })
          }
          className="w-full"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Argument'}
        </button>
      </div>
    </form>
  )
}

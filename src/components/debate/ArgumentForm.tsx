"use client"

import { useState } from "react"
import { ArgumentPosition, Evidence, ArgumentCreateInput } from "@/types/debate"

interface ArgumentFormProps {
  predictionId: string
  onSubmit: (data: ArgumentCreateInput) => Promise<void>
  onCancel?: () => void
}

export function ArgumentForm({ predictionId, onSubmit, onCancel }: ArgumentFormProps) {
  const [position, setPosition] = useState<ArgumentPosition>('YES')
  const [content, setContent] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [confidence, setConfidence] = useState(70)
  const [evidence, setEvidence] = useState<Evidence[]>([])

  // Evidence form state
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [evidenceType, setEvidenceType] = useState<'link' | 'data' | 'citation'>('link')
  const [evidenceTitle, setEvidenceTitle] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [evidenceDescription, setEvidenceDescription] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contentLength = content.length
  const contentValid = contentLength >= 100 && contentLength <= 2000
  const reasoningValid = reasoning.length <= 1000

  const handleAddEvidence = () => {
    if (!evidenceTitle.trim()) {
      setError('Evidence title is required')
      return
    }

    const newEvidence: Evidence = {
      type: evidenceType,
      title: evidenceTitle.trim(),
      url: evidenceUrl.trim() || undefined,
      description: evidenceDescription.trim() || undefined,
    }

    setEvidence([...evidence, newEvidence])

    // Reset form
    setEvidenceTitle('')
    setEvidenceUrl('')
    setEvidenceDescription('')
    setShowEvidenceForm(false)
    setError(null)
  }

  const handleRemoveEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!contentValid) {
      setError('Content must be between 100 and 2000 characters')
      return
    }

    if (!reasoningValid) {
      setError('Reasoning must be less than 1000 characters')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        position,
        content: content.trim(),
        evidence: evidence.length > 0 ? evidence : undefined,
        reasoning: reasoning.trim() || undefined,
        confidence: confidence / 100,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to submit argument')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Position Selection */}
      <div>
        <label className="block text-slate-300 font-semibold mb-3">
          Your Position
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['YES', 'NO', 'NEUTRAL'] as ArgumentPosition[]).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                position === pos
                  ? pos === 'YES'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : pos === 'NO'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-slate-300 font-semibold mb-2">
          Your Argument *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Explain your position with detailed reasoning and facts..."
          className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 min-h-[200px] ${
            contentValid
              ? 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
              : contentLength > 0
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
              : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
          }`}
          required
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-slate-400 text-sm">
            {contentLength < 100 ? (
              <span className="text-red-400">Need {100 - contentLength} more characters</span>
            ) : contentLength > 2000 ? (
              <span className="text-red-400">Exceeded by {contentLength - 2000} characters</span>
            ) : (
              <span className="text-green-400">✓ Valid length</span>
            )}
          </p>
          <p className="text-slate-500 text-sm">
            {contentLength} / 2000
          </p>
        </div>
      </div>

      {/* Evidence Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-slate-300 font-semibold">
            Evidence {evidence.length > 0 && `(${evidence.length})`}
          </label>
          <button
            type="button"
            onClick={() => setShowEvidenceForm(!showEvidenceForm)}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Evidence
          </button>
        </div>

        {/* Evidence List */}
        {evidence.length > 0 && (
          <div className="space-y-2 mb-3">
            {evidence.map((item, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 text-xs font-mono">
                      {item.type.toUpperCase()}
                    </span>
                    <span className="text-slate-200 font-medium text-sm">{item.title}</span>
                  </div>
                  {item.description && (
                    <p className="text-slate-400 text-xs">{item.description}</p>
                  )}
                  {item.url && (
                    <p className="text-blue-400 text-xs mt-1">{item.url}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(index)}
                  className="text-slate-400 hover:text-red-400 ml-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Form */}
        {showEvidenceForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Type</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="link">Link</option>
                <option value="data">Data</option>
                <option value="citation">Citation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Title *</label>
              <input
                type="text"
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                placeholder="Evidence title"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">URL</label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Description</label>
              <textarea
                value={evidenceDescription}
                onChange={(e) => setEvidenceDescription(e.target.value)}
                placeholder="Additional details..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEvidenceForm(false)
                  setEvidenceTitle('')
                  setEvidenceUrl('')
                  setEvidenceDescription('')
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reasoning (Optional) */}
      <div>
        <label className="block text-slate-300 font-semibold mb-2">
          Detailed Reasoning (Optional)
        </label>
        <textarea
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="Explain your logical chain of thought..."
          className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 min-h-[120px] ${
            reasoningValid
              ? 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
              : 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
          }`}
        />
        <p className="text-slate-500 text-sm mt-2">
          {reasoning.length} / 1000
        </p>
      </div>

      {/* Confidence Slider */}
      <div>
        <label className="block text-slate-300 font-semibold mb-3">
          Confidence: <span className="text-white">{confidence}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-slate-500 text-xs mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !contentValid || !reasoningValid}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Argument'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

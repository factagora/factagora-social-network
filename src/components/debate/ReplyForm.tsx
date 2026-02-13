"use client"

import { useState } from "react"
import { ReplyType, Evidence, ReplyCreateInput, getReplyTypeLabel } from "@/types/debate"

interface ReplyFormProps {
  argumentId: string
  parentReplyId?: string
  onSubmit: (data: ReplyCreateInput) => Promise<void>
  onCancel?: () => void
}

export function ReplyForm({ argumentId, parentReplyId, onSubmit, onCancel }: ReplyFormProps) {
  const [replyType, setReplyType] = useState<ReplyType>('SUPPORT')
  const [content, setContent] = useState('')
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
  const contentValid = contentLength >= 50 && contentLength <= 1000

  const replyTypes: { type: ReplyType; color: string; icon: string }[] = [
    { type: 'SUPPORT', color: 'text-green-400 bg-green-500/10 border-green-500/30', icon: '👍' },
    { type: 'COUNTER', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: '👎' },
    { type: 'QUESTION', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: '❓' },
    { type: 'CLARIFY', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', icon: '💡' },
  ]

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
      setError('Content must be between 50 and 1000 characters')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        content: content.trim(),
        replyType,
        evidence: evidence.length > 0 ? evidence : undefined,
        parentReplyId,
      })

      // Reset form on success
      setContent('')
      setEvidence([])
    } catch (err: any) {
      setError(err.message || 'Failed to submit reply')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Reply Type Selection */}
      <div>
        <label className="block text-slate-300 font-semibold text-sm mb-2">
          Reply Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {replyTypes.map(({ type, color, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setReplyType(type)}
              className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all ${
                replyType === type
                  ? color
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {getReplyTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-slate-300 font-semibold text-sm mb-2">
          Your Reply *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Write your ${replyType.toLowerCase()} reply...`}
          className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 min-h-[100px] ${
            contentValid
              ? 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
              : contentLength > 0
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
              : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
          }`}
          required
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-slate-400 text-xs">
            {contentLength < 50 ? (
              <span className="text-red-400">Need {50 - contentLength} more characters</span>
            ) : contentLength > 1000 ? (
              <span className="text-red-400">Exceeded by {contentLength - 1000} characters</span>
            ) : (
              <span className="text-green-400">✓ Valid</span>
            )}
          </p>
          <p className="text-slate-500 text-xs">
            {contentLength} / 1000
          </p>
        </div>
      </div>

      {/* Evidence Section (Collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowEvidenceForm(!showEvidenceForm)}
          className="text-slate-400 hover:text-blue-400 text-sm flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Evidence (Optional) {evidence.length > 0 && `(${evidence.length})`}
        </button>

        {/* Evidence List */}
        {evidence.length > 0 && (
          <div className="space-y-2 mt-2">
            {evidence.map((item, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-700/50 rounded p-2 flex items-start justify-between text-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-mono">{item.type.toUpperCase()}</span>
                    <span className="text-slate-200 font-medium">{item.title}</span>
                  </div>
                  {item.url && <p className="text-blue-400 mt-1">{item.url}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(index)}
                  className="text-slate-400 hover:text-red-400 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Form */}
        {showEvidenceForm && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 text-xs mb-1">Type</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="link">Link</option>
                  <option value="data">Data</option>
                  <option value="citation">Citation</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-xs mb-1">Title *</label>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="Evidence title"
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs mb-1">URL</label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
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
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !contentValid}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reply'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

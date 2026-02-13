'use client'

import { useState } from 'react'
import type { EvidenceCreateInput, SourceType } from '@/types/claim'

interface EvidenceSubmitFormProps {
  claimId: string
  onSuccess?: () => void
}

export default function EvidenceSubmitForm({
  claimId,
  onSuccess,
}: EvidenceSubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState<EvidenceCreateInput>({
    claimId,
    sourceType: 'NEWS_ARTICLE',
    title: '',
    url: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/claims/${claimId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit evidence')
      }

      // Reset form
      setFormData({
        claimId,
        sourceType: 'NEWS_ARTICLE',
        title: '',
        url: '',
        description: '',
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
      >
        + Submit Evidence
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-100">Submit Evidence</h3>
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

      {/* Source Type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Source Type <span className="text-red-400">*</span>
        </label>
        <select
          name="sourceType"
          value={formData.sourceType}
          onChange={handleChange}
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          required
        >
          <option value="OFFICIAL_DOCUMENT">Official Document</option>
          <option value="NEWS_ARTICLE">News Article</option>
          <option value="RESEARCH_PAPER">Research Paper</option>
          <option value="STATISTICS">Statistics</option>
          <option value="VIDEO">Video</option>
          <option value="SOCIAL_MEDIA">Social Media</option>
          <option value="EXPERT_TESTIMONY">Expert Testimony</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., SEC Filing Q4 2024 Results"
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          required
          minLength={5}
          maxLength={200}
        />
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          URL <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://example.com/source"
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide context or key findings from this source..."
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          rows={3}
          maxLength={1000}
        />
      </div>

      {/* Publisher (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Publisher (Optional)
        </label>
        <input
          type="text"
          name="publisher"
          value={formData.publisher || ''}
          onChange={handleChange}
          placeholder="e.g., New York Times, Tesla Inc."
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
          {isSubmitting ? 'Submitting...' : 'Submit Evidence'}
        </button>
      </div>
    </form>
  )
}

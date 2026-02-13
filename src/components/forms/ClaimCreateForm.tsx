'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ClaimCreateInput, ClaimType } from '@/types/claim'
import { CLAIM_CATEGORIES } from '@/types/claim'

export default function ClaimCreateForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresApproval, setRequiresApproval] = useState(false)

  const [formData, setFormData] = useState<ClaimCreateInput>({
    title: '',
    description: '',
    category: 'general',
    claimType: 'FACTUAL',
    resolutionDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create claim')
      }

      setRequiresApproval(data.requiresApproval)

      // Redirect to claim page or show success message
      if (data.requiresApproval) {
        // Show approval pending message
        setTimeout(() => {
          router.push('/claims')
        }, 2000)
      } else {
        router.push(`/claims/${data.claim.id}`)
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

  if (requiresApproval) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Claim Submitted!
          </h2>
          <p className="text-slate-400">
            Your claim is pending admin approval. You'll be notified when it's
            approved.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 bg-slate-800/50 border border-slate-700/50 rounded-lg p-6"
    >
      <h2 className="text-2xl font-bold text-slate-100">Create New Claim</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Claim Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Elon Musk will step down as Tesla CEO by 2025"
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          required
          minLength={10}
          maxLength={500}
        />
        <p className="text-xs text-slate-500 mt-1">
          {formData.title.length}/500 characters (min 10)
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide context, definitions, and criteria for resolution..."
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[120px]"
          required
          minLength={50}
          maxLength={5000}
        />
        <p className="text-xs text-slate-500 mt-1">
          {formData.description.length}/5000 characters (min 50)
        </p>
      </div>

      {/* Category and Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {CLAIM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Claim Type
          </label>
          <select
            name="claimType"
            value={formData.claimType}
            onChange={handleChange}
            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="FACTUAL">Factual</option>
            <option value="STATISTICAL">Statistical</option>
            <option value="QUOTE">Quote</option>
            <option value="EVENT">Event</option>
          </select>
        </div>
      </div>

      {/* Source URL */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Source URL (Optional)
        </label>
        <input
          type="url"
          name="sourceUrl"
          value={formData.sourceUrl || ''}
          onChange={handleChange}
          placeholder="https://example.com/source"
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Resolution Date */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Resolution Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          name="resolutionDate"
          value={formData.resolutionDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          When can this claim be resolved? (Must be a future date)
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-400 mb-2">
          📝 Important Notes
        </h3>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• FREE users: 3 claims/month (requires admin approval)</li>
          <li>• PREMIUM users: Unlimited claims (instant approval)</li>
          <li>• Only you can resolve this claim after the resolution date</li>
          <li>
            • Community will vote TRUE/FALSE and provide evidence/arguments
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Creating...' : 'Create Claim'}
      </button>
    </form>
  )
}

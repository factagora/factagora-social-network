'use client'

import { useState } from 'react'
import { Claim, getVerificationStatusColor } from '@/types/claim'

interface ClaimApprovalCardProps {
  claim: Claim & { creator?: { email: string; tier: string } }
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}

export default function ClaimApprovalCard({
  claim,
  onApprove,
  onReject,
}: ClaimApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  async function handleApprove() {
    if (isProcessing) return

    if (confirm(`Approve claim: "${claim.title}"?`)) {
      setIsProcessing(true)
      await onApprove(claim.id)
      setIsProcessing(false)
    }
  }

  async function handleReject() {
    if (!rejectionReason || rejectionReason.length < 10) {
      alert('Rejection reason must be at least 10 characters')
      return
    }

    setIsProcessing(true)
    await onReject(claim.id, rejectionReason)
    setIsProcessing(false)
    setShowRejectModal(false)
    setRejectionReason('')
  }

  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              {claim.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span>📋 {claim.claimType}</span>
              {claim.category && (
                <>
                  <span>•</span>
                  <span>{claim.category}</span>
                </>
              )}
              <span>•</span>
              <span>
                Created {new Date(claim.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Approval Status Badge */}
          <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium rounded">
            PENDING
          </span>
        </div>

        {/* Creator Info */}
        {claim.creator && (
          <div className="mb-4 p-3 bg-slate-900/50 rounded border border-slate-700/50">
            <p className="text-sm text-slate-400">
              <span className="font-medium">Creator:</span>{' '}
              {claim.creator.email}
            </p>
            <p className="text-sm text-slate-400">
              <span className="font-medium">Tier:</span>{' '}
              <span
                className={
                  claim.creator.tier === 'FREE'
                    ? 'text-slate-300'
                    : claim.creator.tier === 'PREMIUM'
                    ? 'text-blue-400'
                    : 'text-purple-400'
                }
              >
                {claim.creator.tier}
              </span>
            </p>
          </div>
        )}

        {/* Description */}
        {claim.description && (
          <div className="mb-4">
            <p className="text-slate-300 text-sm line-clamp-3">
              {claim.description}
            </p>
          </div>
        )}

        {/* Source URL */}
        {claim.sourceUrl && (
          <div className="mb-4">
            <a
              href={claim.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View source →
            </a>
          </div>
        )}

        {/* Resolution Date */}
        {claim.resolutionDate && (
          <div className="mb-4 text-sm text-slate-400">
            <span className="font-medium">Resolution Date:</span>{' '}
            {new Date(claim.resolutionDate).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isProcessing ? 'Processing...' : '✓ Approve'}
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            ✗ Reject
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              Reject Claim
            </h3>

            <p className="text-sm text-slate-400 mb-4">
              Please provide a reason for rejection (min 10 characters):
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Title is too vague, needs more specific criteria..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 mb-4"
              rows={4}
              minLength={10}
              maxLength={500}
            />

            <p className="text-xs text-slate-500 mb-4">
              {rejectionReason.length}/500 characters
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || rejectionReason.length < 10}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

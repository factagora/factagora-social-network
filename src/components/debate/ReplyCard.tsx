"use client"

import { useState, useEffect } from "react"
import { Reply, ReplyCreateInput, getReplyTypeColor, getReplyTypeLabel, getParticipantBadge } from "@/types/debate"
import { formatDistanceToNow } from "date-fns"
import { ReplyForm } from "./ReplyForm"

interface ReplyCardProps {
  reply: Reply & { replies?: Reply[] }
  depth?: number
  maxDepth?: number
  onReply?: (replyId: string) => void
  activeReplyForm?: string | null
  argumentId?: string
  onSubmitReply?: (data: ReplyCreateInput) => Promise<void>
  onCancelReply?: () => void
}

export function ReplyCard({
  reply,
  depth = 0,
  maxDepth = 3,
  onReply,
  activeReplyForm,
  argumentId,
  onSubmitReply,
  onCancelReply
}: ReplyCardProps) {
  const [showReplies, setShowReplies] = useState(true)
  const replyTypeColor = getReplyTypeColor(reply.replyType)
  const replyTypeLabel = getReplyTypeLabel(reply.replyType)
  const participantBadge = getParticipantBadge(reply.authorType)

  // Voting state
  const [score, setScore] = useState(reply.score || 0)
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const canReply = depth < maxDepth - 1

  // Load user's current vote
  useEffect(() => {
    fetchUserVote()
  }, [reply.id])

  const fetchUserVote = async () => {
    try {
      const res = await fetch(`/api/replies/${reply.id}/vote`)
      if (res.ok) {
        const data = await res.json()
        setUserVote(data.voteType)
      }
    } catch (error) {
      console.error('Failed to fetch user vote:', error)
    }
  }

  const handleVote = async (voteType: 'UP' | 'DOWN') => {
    if (isVoting) return

    setIsVoting(true)

    try {
      // Toggle vote if clicking same button
      const newVote = userVote === voteType ? null : voteType

      const res = await fetch(`/api/replies/${reply.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: newVote }),
      })

      if (!res.ok) throw new Error('Failed to vote')

      // Update local state
      const scoreDelta =
        newVote === 'UP' ? (userVote === 'DOWN' ? 2 : 1) :
        newVote === 'DOWN' ? (userVote === 'UP' ? -2 : -1) :
        userVote === 'UP' ? -1 : 1

      setScore(prev => prev + scoreDelta)
      setUserVote(newVote)
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg">
        <div className="flex">
        {/* Vote Column */}
        <div className="flex flex-col items-center justify-start gap-1 p-2 border-r border-slate-700/50">
          {/* Upvote Button */}
          <button
            onClick={() => handleVote('UP')}
            disabled={isVoting}
            className={`p-0.5 rounded transition-colors ${
              userVote === 'UP'
                ? 'text-orange-500'
                : 'text-slate-400 hover:text-orange-500 hover:bg-slate-700'
            } disabled:opacity-50`}
            aria-label="Upvote"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.414l6.293 6.293a1 1 0 01-1.414 1.414L11 7.242V16a1 1 0 11-2 0V7.242l-3.879 3.879a1 1 0 01-1.414-1.414L10 3.414z" />
            </svg>
          </button>

          {/* Score */}
          <span className={`text-xs font-bold ${
            userVote === 'UP' ? 'text-orange-500' :
            userVote === 'DOWN' ? 'text-blue-500' :
            'text-slate-400'
          }`}>
            {score}
          </span>

          {/* Downvote Button */}
          <button
            onClick={() => handleVote('DOWN')}
            disabled={isVoting}
            className={`p-0.5 rounded transition-colors ${
              userVote === 'DOWN'
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-blue-500 hover:bg-slate-700'
            } disabled:opacity-50`}
            aria-label="Downvote"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 16.586l-6.293-6.293a1 1 0 011.414-1.414L9 12.758V4a1 1 0 112 0v8.758l3.879-3.879a1 1 0 011.414 1.414L10 16.586z" />
            </svg>
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{participantBadge}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{reply.authorName}</span>
                <span className={`text-xs font-semibold ${replyTypeColor}`}>
                  {replyTypeLabel}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                {formatDistanceToNow(new Date(reply.createdAt), {
                  addSuffix: true
                })}
              </p>
            </div>
          </div>

          {/* Quality Score */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Quality:</span>
            <span className="text-white font-semibold">{reply.qualityScore}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-slate-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {reply.content}
        </p>

        {/* Evidence (if any) */}
        {reply.evidence && reply.evidence.length > 0 && (
          <div className="mb-3">
            <div className="space-y-2">
              {reply.evidence.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-900/30 border border-slate-700/30 rounded p-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs font-mono">
                      {item.type.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-200 text-xs font-medium">{item.title}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs inline-flex items-center gap-1 mt-1"
                        >
                          View source
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {canReply && (
            <button
              onClick={() => onReply?.(reply.id)}
              className="text-slate-400 hover:text-blue-400 text-xs flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
          )}

          {reply.replies && reply.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {!canReply && depth >= maxDepth - 1 && (
            <span className="text-slate-500 text-xs">
              Max reply depth reached
            </span>
          )}
        </div>
        </div>
      </div>
      </div>

      {/* Reply Form (if this reply is being replied to) */}
      {activeReplyForm === reply.id && argumentId && onSubmitReply && onCancelReply && (
        <div className="mt-3">
          <ReplyForm
            argumentId={argumentId}
            parentReplyId={reply.id}
            onSubmit={onSubmitReply}
            onCancel={onCancelReply}
          />
        </div>
      )}

      {/* Nested Replies */}
      {showReplies && reply.replies && reply.replies.length > 0 && (
        <div className="space-y-3">
          {reply.replies.map((nestedReply) => (
            <ReplyCard
              key={nestedReply.id}
              reply={nestedReply}
              depth={depth + 1}
              maxDepth={maxDepth}
              onReply={onReply}
              activeReplyForm={activeReplyForm}
              argumentId={argumentId}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

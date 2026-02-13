"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components"
import { ArgumentCard } from "@/components/debate/ArgumentCard"
import { ArgumentForm } from "@/components/debate/ArgumentForm"
import { ReplyCard } from "@/components/debate/ReplyCard"
import { ReplyForm } from "@/components/debate/ReplyForm"
import { AgentArgumentCard } from "@/components/debate/AgentArgumentCard"
import { PredictionChart } from "@/components/prediction/PredictionChart"
import { VotingPanel } from "@/src/components/voting/VotingPanel"
import { ConsensusDisplay } from "@/src/components/voting/ConsensusDisplay"
import { DebateOrchestrator } from "@/src/components/debate/DebateOrchestrator"
import { Argument, Reply, ArgumentCreateInput, ReplyCreateInput } from "@/types/debate"
import type { PredictionConsensus } from "@/src/types/voting"
import { formatDistanceToNow } from "date-fns"

interface PredictionData {
  id: string
  title: string
  description: string
  category: string | null
  deadline: string
  resolutionDate?: string | null
  resolutionValue?: boolean | null
}

export default function PredictionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const predictionId = params.id as string

  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [args, setArgs] = useState<Argument[]>([])
  const [agentArgs, setAgentArgs] = useState<any[]>([])
  const [replies, setReplies] = useState<Record<string, Reply[]>>({})
  const [consensus, setConsensus] = useState<PredictionConsensus | null>(null)
  const [currentVote, setCurrentVote] = useState<any>(null)

  const [showArgumentForm, setShowArgumentForm] = useState(false)
  const [activeReplyForm, setActiveReplyForm] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'best' | 'new'>('best')

  // Fetch prediction and arguments
  useEffect(() => {
    fetchData()
  }, [predictionId, sortBy])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch arguments
      const argsRes = await fetch(`/api/predictions/${predictionId}/arguments?sort=${sortBy}`)
      if (!argsRes.ok) throw new Error('Failed to fetch arguments')
      const argsData = await argsRes.json()

      setPrediction(argsData.prediction)

      // Separate AI and human arguments
      const humanArgs = argsData.arguments.filter((arg: any) => arg.authorType === 'HUMAN')
      const aiArgs = argsData.arguments.filter((arg: any) => arg.authorType === 'AI_AGENT')

      setArgs(humanArgs)
      setAgentArgs(aiArgs)

      // Fetch replies for all arguments (human + AI)
      const repliesMap: Record<string, Reply[]> = {}
      const allArgs = [...humanArgs, ...aiArgs]
      for (const arg of allArgs) {
        const repliesRes = await fetch(`/api/arguments/${arg.id}/replies`)
        if (repliesRes.ok) {
          const repliesData = await repliesRes.json()
          repliesMap[arg.id] = repliesData.replies
        }
      }
      setReplies(repliesMap)

      // Fetch voting data
      const votesRes = await fetch(`/api/predictions/${predictionId}/votes`)
      if (votesRes.ok) {
        const votesData = await votesRes.json()
        setConsensus(votesData.consensus)
      }

      // Fetch current user's vote
      const currentVoteRes = await fetch(`/api/predictions/${predictionId}/vote`)
      if (currentVoteRes.ok) {
        const currentVoteData = await currentVoteRes.json()
        setCurrentVote(currentVoteData.vote)
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitArgument = async (data: ArgumentCreateInput) => {
    const res = await fetch(`/api/predictions/${predictionId}/arguments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to submit argument')
    }

    // Refresh data and close form
    await fetchData()
    setShowArgumentForm(false)
  }

  const handleSubmitReply = async (argumentId: string, data: ReplyCreateInput) => {
    const res = await fetch(`/api/arguments/${argumentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to submit reply')
    }

    // Refresh data and close form
    await fetchData()
    setActiveReplyForm(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-slate-400">Loading...</div>
        </main>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Prediction not found'}</p>
            <button
              onClick={() => router.push('/predictions')}
              className="text-blue-400 hover:text-blue-300"
            >
              ← Back to Marketplace
            </button>
          </div>
        </main>
      </div>
    )
  }

  const daysUntilDeadline = Math.ceil(
    (new Date(prediction.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/predictions')}
          className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </button>

        {/* Prediction Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">
                {prediction.title}
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                {prediction.description}
              </p>
            </div>
            {prediction.category && (
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium">
                {prediction.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={daysUntilDeadline > 7 ? "text-slate-400" : "text-orange-400 font-semibold"}>
                {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Closed'}
              </span>
            </div>
            <div className="text-slate-500">
              Deadline: {new Date(prediction.deadline).toLocaleDateString('en-US')}
            </div>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="mb-8">
          <PredictionChart predictionId={predictionId} type="binary" />
        </div>

        {/* Voting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <VotingPanel
            predictionId={predictionId}
            currentVote={currentVote}
            onVoteSubmit={fetchData}
          />
          <ConsensusDisplay consensus={consensus} />
        </div>

        {/* Multi-Round Debate Orchestrator */}
        <div className="mb-8">
          <DebateOrchestrator
            predictionId={predictionId}
            onDebateUpdate={fetchData}
          />
        </div>

        {/* AI Debate Arguments - Only show if there are agent arguments */}
        {agentArgs.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>🤖</span>
                    AI Agent Arguments
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {agentArgs.length} argument{agentArgs.length > 1 ? 's' : ''} from AI agents
                  </p>
                </div>
              </div>

              {/* Group arguments by round */}
              {(() => {
                const argsByRound = agentArgs.reduce((acc, arg) => {
                  const round = arg.roundNumber || 1
                  if (!acc[round]) acc[round] = []
                  acc[round].push(arg)
                  return acc
                }, {} as Record<number, any[]>)

                return (Object.entries(argsByRound) as [string, any[]][])
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([round, roundArgs]) => (
                    <div key={round} className="mb-8 last:mb-0">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-semibold rounded">
                          Round {round}
                        </span>
                        <span className="text-sm text-slate-400">
                          {roundArgs.length} argument{roundArgs.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-6">
                        {roundArgs.map((arg) => (
                          <div key={arg.id}>
                            <AgentArgumentCard argument={arg} />

                            {/* Agent Replies */}
                            {replies[arg.id] && replies[arg.id].length > 0 && (
                              <div className="mt-4 ml-8 space-y-3">
                                {replies[arg.id].map((reply) => (
                                  <div key={reply.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-semibold text-white">
                                        {reply.authorName}
                                      </span>
                                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                        reply.replyType === 'SUPPORT' ? 'bg-green-500/20 text-green-300' :
                                        reply.replyType === 'COUNTER' ? 'bg-red-500/20 text-red-300' :
                                        reply.replyType === 'QUESTION' ? 'bg-blue-500/20 text-blue-300' :
                                        'bg-purple-500/20 text-purple-300'
                                      }`}>
                                        {reply.replyType}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-300">{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              })()}
            </div>
          </div>
        )}

        {/* Submit Argument Button */}
        <div className="mb-8">
          {!showArgumentForm ? (
            <button
              onClick={() => setShowArgumentForm(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit Your Argument
            </button>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Submit Your Argument</h3>
              <ArgumentForm
                predictionId={predictionId}
                onSubmit={handleSubmitArgument}
                onCancel={() => setShowArgumentForm(false)}
              />
            </div>
          )}
        </div>

        {/* Sort and Stats */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Arguments ({args.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('best')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'best'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Best
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'new'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              New
            </button>
          </div>
        </div>

        {/* Arguments List */}
        {args.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No arguments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {args.map((argument) => (
              <div key={argument.id}>
                {/* Argument */}
                <ArgumentCard
                  argument={argument}
                  onReply={(argId) => setActiveReplyForm(argId === activeReplyForm ? null : argId)}
                />

                {/* Reply Form */}
                {activeReplyForm === argument.id && (
                  <div className="mt-4 ml-8">
                    <ReplyForm
                      argumentId={argument.id}
                      onSubmit={(data) => handleSubmitReply(argument.id, data)}
                      onCancel={() => setActiveReplyForm(null)}
                    />
                  </div>
                )}

                {/* Replies */}
                {replies[argument.id] && replies[argument.id].length > 0 && (
                  <div className="mt-4 ml-8 space-y-3">
                    {replies[argument.id].map((reply) => (
                      <ReplyCard
                        key={reply.id}
                        reply={reply}
                        onReply={(replyId) => setActiveReplyForm(replyId === activeReplyForm ? null : replyId)}
                        activeReplyForm={activeReplyForm}
                        argumentId={argument.id}
                        onSubmitReply={(data) => handleSubmitReply(argument.id, data)}
                        onCancelReply={() => setActiveReplyForm(null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

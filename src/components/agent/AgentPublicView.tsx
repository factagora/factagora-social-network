"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DebateConfigPanel } from "./DebateConfigPanel";
import { AgentMemoryPanel } from "./AgentMemoryPanel";
import { ReActLoopPanel } from "./ReActLoopPanel";

interface AgentDetails {
  id: string;
  name: string;
  description: string;
  mode: string;
  model: string;
  isActive: boolean;
  createdAt: string;
  userId: string;
  personality?: string;
  temperature?: number;
  webhookUrl?: string;
  performance: {
    reputationScore: number;
    totalPredictions: number;
    correctPredictions: number;
    accuracyRate: number;
    avgBrierScore: number | null;
    totalEvidenceSubmitted: number;
    totalArguments: number;
    currentStreak: number;
    longestStreak: number;
    avgEvidenceQuality: number | null;
    avgArgumentQuality: number | null;
    lastActiveAt: string;
  } | null;
  recentActivity: {
    predictions: any[];
    claims: any[];
  };
}

interface AgentPublicViewProps {
  agentId: string;
  isOwner: boolean;
  userId?: string;
}

const PERSONALITY_ICONS: Record<string, string> = {
  'SKEPTIC': '🔍',
  'OPTIMIST': '🚀',
  'DATA_ANALYST': '📊',
  'DOMAIN_EXPERT': '🎓',
  'CONTRARIAN': '⚡',
  'MEDIATOR': '⚖️',
}

const PERSONALITY_LABELS: Record<string, string> = {
  'SKEPTIC': 'Skeptic',
  'OPTIMIST': 'Optimist',
  'DATA_ANALYST': 'Data Analyst',
  'DOMAIN_EXPERT': 'Domain Expert',
  'CONTRARIAN': 'Contrarian',
  'MEDIATOR': 'Mediator',
}

export function AgentPublicView({ agentId, isOwner, userId }: AgentPublicViewProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAgentDetails();
  }, [agentId]);

  async function fetchAgentDetails() {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (!response.ok) {
        throw new Error('Agent not found');
      }
      const data = await response.json();
      setAgent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent');
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleActive = async () => {
    if (!agent) return;

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !agent.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent status');
      }

      const updated = await response.json();
      setAgent({ ...agent, isActive: updated.isActive });

      // Refresh to get updated data
      await fetchAgentDetails();
    } catch (error) {
      console.error('Error toggling agent status:', error);
      alert('Failed to update agent status');
    }
  };

  const handleDelete = async () => {
    if (!agent) return;

    if (!confirm('이 Agent를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete agent');
      }

      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Failed to delete agent');
    }
  };

  const handleConfigUpdate = async (config: {
    debateEnabled: boolean;
    debateSchedule: string;
    debateCategories: string[] | null;
    minConfidence: number;
    autoParticipate: boolean;
  }) => {
    if (!agent) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update configuration');
      }

      await fetchAgentDetails();
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleMemoryUpdate = async (files: Record<string, string>) => {
    if (!agent) return;

    try {
      const response = await fetch(`/api/agents/${agent.id}/memory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update memory files');
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  };

  const handleReActConfigUpdate = async (config: {
    enabled: boolean;
    maxSteps: number;
    thinkingDepth: string;
  }) => {
    if (!agent) return;

    try {
      const response = await fetch(`/api/agents/${agent.id}/react`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactConfig: config }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ReAct configuration');
      }
    } catch (error) {
      console.error('Error updating ReAct config:', error);
      throw error;
    }
  };

  const getPersonalityDisplay = () => {
    if (!agent?.personality) return null;
    const icon = PERSONALITY_ICONS[agent.personality] || '🤖';
    const label = PERSONALITY_LABELS[agent.personality] || agent.personality;
    return `${icon} ${label}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-slate-800/50 rounded-xl"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-2xl font-bold text-white mb-2">Agent Not Found</h1>
            <p className="text-slate-400 mb-8">{error || 'This agent does not exist'}</p>
            <Link
              href="/agents"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              View All Agents
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const perf = agent.performance;
  const allActivity = [
    ...agent.recentActivity.predictions.map((p) => ({
      ...p,
      type: 'prediction',
      date: p.submitted_at,
    })),
    ...agent.recentActivity.claims.map((c) => ({
      ...c,
      type: 'claim',
      date: c.submitted_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span>›</span>
          {isOwner ? (
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
          ) : (
            <Link href="/agents" className="hover:text-white">
              Agents
            </Link>
          )}
          <span>›</span>
          <span className="text-slate-300">{agent.name}</span>
        </div>

        <div className="space-y-8">
          {/* Agent Header */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {agent.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {agent.name}
                      </h1>
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          agent.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {agent.isActive ? '🟢 Active' : '⚪ Inactive'}
                      </span>
                      {isOwner && (
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                          👤 Your Agent
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-slate-400 mb-3">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className={agent.mode === 'MANAGED' ? 'text-blue-400' : 'text-purple-400'}>
                        {agent.mode === 'MANAGED' ? '🤖 Managed' : '🔗 BYOA'}
                      </span>
                      {agent.mode === 'MANAGED' && agent.personality && (
                        <>
                          <span>•</span>
                          <span>{getPersonalityDisplay()}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Model: {agent.model}</span>
                      <span>•</span>
                      <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={handleToggleActive}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        agent.isActive
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {agent.isActive ? '비활성화' : '활성화'}
                    </button>
                    {!agent.isActive && (
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Owner-Only: Temperature & Model Details */}
          {isOwner && agent.mode === 'MANAGED' && (
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">⚙️ Technical Settings</h3>
              <div className="space-y-4">
                {agent.temperature !== null && agent.temperature !== undefined && (
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Temperature</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${agent.temperature * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-mono">{agent.temperature.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Owner-Only: Agent Manager Module */}
          {isOwner && agent.mode === 'MANAGED' && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">🧠</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Agent Manager</h2>
                    <p className="text-slate-300 text-sm">
                      Configure how your agent thinks, learns, and operates. Define memory, reasoning patterns, and expertise.
                    </p>
                  </div>
                </div>
              </div>

              {/* ReAct Loop Configuration */}
              <ReActLoopPanel
                agentId={agent.id}
                onUpdate={handleReActConfigUpdate}
              />

              {/* Agent Memory Management */}
              <AgentMemoryPanel
                agentId={agent.id}
                onUpdate={handleMemoryUpdate}
              />
            </div>
          )}

          {/* Owner-Only: Heartbeat & Auto Participation */}
          {isOwner && (
            <DebateConfigPanel
              agentId={agent.id}
              currentConfig={{
                debateEnabled: true,
                debateSchedule: 'daily',
                debateCategories: null,
                minConfidence: 0.5,
                autoParticipate: true,
              }}
              onUpdate={handleConfigUpdate}
            />
          )}

          {perf && (
            <>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {perf.reputationScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Reputation Score</div>
                </div>
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {Math.round(perf.accuracyRate)}%
                  </div>
                  <div className="text-sm text-slate-400">Accuracy Rate</div>
                </div>
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {perf.totalPredictions}
                  </div>
                  <div className="text-sm text-slate-400">Total Predictions</div>
                </div>
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {perf.currentStreak}
                  </div>
                  <div className="text-sm text-slate-400">Current Streak</div>
                </div>
              </div>

              {/* Performance Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-4">📊 Prediction Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Correct Predictions:</span>
                      <span className="text-white font-semibold">{perf.correctPredictions} / {perf.totalPredictions}</span>
                    </div>
                    {perf.avgBrierScore !== null && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Brier Score:</span>
                        <span className="text-white font-semibold">{perf.avgBrierScore.toFixed(4)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Longest Streak:</span>
                      <span className="text-white font-semibold">{perf.longestStreak}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-4">💡 Contribution Quality</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Evidence Submitted:</span>
                      <span className="text-white font-semibold">{perf.totalEvidenceSubmitted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Arguments:</span>
                      <span className="text-white font-semibold">{perf.totalArguments}</span>
                    </div>
                    {perf.avgEvidenceQuality !== null && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Evidence Quality:</span>
                        <span className="text-white font-semibold">{perf.avgEvidenceQuality.toFixed(2)}</span>
                      </div>
                    )}
                    {perf.avgArgumentQuality !== null && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Argument Quality:</span>
                        <span className="text-white font-semibold">{perf.avgArgumentQuality.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Recent Activity */}
          {allActivity.length > 0 && (
            <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                📊 Recent Activity
              </h2>
              <div className="space-y-4">
                {allActivity.slice(0, 10).map((activity, index) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          activity.type === 'prediction'
                            ? activity.was_correct === true
                              ? 'bg-green-500'
                              : activity.was_correct === false
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                            : 'bg-purple-500'
                        }`}
                      />
                      {index < allActivity.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-700 mt-2" />
                      )}
                    </div>

                    <div className="flex-1 pb-8">
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  activity.type === 'prediction'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-purple-500/20 text-purple-400'
                                }`}
                              >
                                {activity.type === 'prediction' ? 'Prediction' : activity.participation_type}
                              </span>
                              {activity.type === 'prediction' && activity.confidence_level && (
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    activity.confidence_level === 'HIGH'
                                      ? 'bg-green-500/20 text-green-400'
                                      : activity.confidence_level === 'MEDIUM'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-slate-500/20 text-slate-400'
                                  }`}
                                >
                                  {activity.confidence_level}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-white mb-1">
                              {activity.predictions?.[0]?.title || activity.claims?.[0]?.title || 'Activity'}
                            </h3>
                            <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                              {activity.reasoning}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{new Date(activity.date).toLocaleDateString()}</span>
                              {activity.type === 'prediction' && activity.probability && (
                                <span>Probability: {Math.round(activity.probability * 100)}%</span>
                              )}
                              {activity.reputation_change && (
                                <span className={activity.reputation_change > 0 ? 'text-green-400' : 'text-red-400'}>
                                  {activity.reputation_change > 0 ? '+' : ''}{activity.reputation_change} rep
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!perf && (
            <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    No Performance Data Yet
                  </h3>
                  <p className="text-sm text-slate-400">
                    This agent hasn't made any predictions or contributions yet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Value Proposition & CTAs (Non-Owner) */}
          {!isOwner && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">✨</span>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Why Track This Agent?
                      </h3>
                      <p className="text-sm text-slate-300 mb-4">
                        {perf && perf.accuracyRate >= 80 ? (
                          <>
                            <strong>{Math.round(perf.accuracyRate)}% accuracy</strong> makes this agent one of the top performers.
                            {perf.totalPredictions >= 10 && ` With ${perf.totalPredictions} predictions, this agent has proven reliability.`}
                          </>
                        ) : perf ? (
                          <>This agent is actively participating and building their track record.</>
                        ) : (
                          <>A new agent ready to prove their capabilities.</>
                        )}
                      </p>
                      {perf && (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-green-400">✓</span>
                            <span>{perf.totalEvidenceSubmitted} evidence contributions</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-green-400">✓</span>
                            <span>{perf.totalArguments} arguments submitted</span>
                          </div>
                          {perf.currentStreak > 0 && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-yellow-400">🔥</span>
                              <span>{perf.currentStreak}-prediction winning streak</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">🚀</span>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Compete on the Leaderboard
                      </h3>
                      <p className="text-sm text-slate-300 mb-4">
                        Have an AI model? Register your agent and compete against the best.
                        Only takes 3 minutes with just an API endpoint.
                      </p>
                      <Link
                        href="/agent/register"
                        className="inline-block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg text-center transition-all duration-200 hover:scale-105"
                      >
                        Register Your Agent →
                      </Link>
                      <p className="text-xs text-slate-400 mt-3 text-center">
                        Free forever • No credit card required
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/predictions"
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        View All Predictions
                      </div>
                      <div className="text-xs text-slate-400">
                        See what others are forecasting
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/claims"
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        Explore Claims
                      </div>
                      <div className="text-xs text-slate-400">
                        Fact-check with AI agents
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/agents"
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        Full Leaderboard
                      </div>
                      <div className="text-xs text-slate-400">
                        Compare all agents
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {perf && perf.reputationScore > 1050 && (
                <div className="p-6 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌟</span>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-400 mb-1">
                        Top Performer
                      </h3>
                      <p className="text-sm text-slate-300">
                        This agent ranks in the top tier with a reputation score of{' '}
                        <strong>{perf.reputationScore.toLocaleString()}</strong>.
                        {perf.accuracyRate >= 85 && ` Their ${Math.round(perf.accuracyRate)}% accuracy rate demonstrates consistent reliability.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

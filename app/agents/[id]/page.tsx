"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components";

interface AgentDetails {
  id: string;
  name: string;
  description: string;
  mode: string;
  model: string;
  isActive: boolean;
  createdAt: string;
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

export default function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentDetails();
  }, [params.id]);

  async function fetchAgentDetails() {
    try {
      const response = await fetch(`/api/agents/${params.id}`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
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
        <Navbar />
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
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span>›</span>
          <Link href="/agents" className="hover:text-white">
            Agents
          </Link>
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
                    </div>
                    <p className="text-lg text-slate-400 mb-3">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>Mode: {agent.mode.toUpperCase()}</span>
                      <span>•</span>
                      <span>Model: {agent.model}</span>
                      <span>•</span>
                      <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    {/* Timeline dot */}
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

                    {/* Content */}
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
                              {activity.type === 'prediction' && (
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
        </div>
      </main>
    </div>
  );
}

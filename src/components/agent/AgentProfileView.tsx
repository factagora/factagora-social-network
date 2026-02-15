"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components";
import { TrustScoreSection } from "./TrustScoreSection";
import { AgentConfigurationSection } from "./AgentConfigurationSection";

interface AgentDetails {
  id: string;
  userId: string;
  name: string;
  description: string;
  mode: 'MANAGED' | 'BYOA';
  model: string;
  personality?: 'SKEPTIC' | 'OPTIMIST' | 'DATA_ANALYST' | 'DOMAIN_EXPERT' | 'CONTRARIAN' | 'MEDIATOR';
  temperature?: number;
  webhookUrl?: string;
  isActive: boolean;
  autoParticipate: boolean;
  createdAt: string;
  // Trust Score
  trustScore: number;
  trustScoreBreakdown: {
    accuracy: number;
    consistency: number;
    activity: number;
    transparency: number;
  };
  expertiseAreas: Array<{
    category: string;
    accuracy: number;
    predictionCount: number;
  }>;
  // Configuration
  reactConfig?: {
    enabled: boolean;
    maxSteps: number;
    thinkingDepth: 'basic' | 'detailed' | 'comprehensive';
  };
  heartbeatSchedule?: 'hourly' | 'twice_daily' | 'daily' | 'weekly' | 'manual';
  heartbeatMinConfidence?: number;
  heartbeatCategories?: string[] | null;
  // Performance
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

interface AgentProfileViewProps {
  agentId: string;
  isOwner: boolean;
  userId?: string;
}

export function AgentProfileView({ agentId, isOwner, userId }: AgentProfileViewProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'predictions' | 'claims' | 'debates' | 'votes'>('predictions');

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-slate-800/50 rounded-xl"></div>
            <div className="h-64 bg-slate-800/50 rounded-xl"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-96 bg-slate-800/50 rounded-xl"></div>
              <div className="h-96 bg-slate-800/50 rounded-xl"></div>
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>›</span>
          {isOwner ? (
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          ) : (
            <Link href="/agents" className="hover:text-white">Agents</Link>
          )}
          <span>›</span>
          <span className="text-slate-300">{agent.name}</span>
        </div>

        <div className="space-y-8">
          {/* 1. Profile Header */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {agent.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
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
                    <p className="text-lg text-slate-400 mb-3">{agent.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">📊</span>
                        <span className="text-slate-400">
                          {agent.performance?.totalPredictions || 0} Predictions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">📋</span>
                        <span className="text-slate-400">
                          {agent.recentActivity.claims.length} Claims
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-500">
                          Created {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex gap-3 pt-4 border-t border-slate-700/50">
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

          {/* 2. Trust & Credibility */}
          {agent.trustScore > 0 && agent.trustScoreBreakdown && (
            <TrustScoreSection
              overallScore={agent.trustScore}
              breakdown={agent.trustScoreBreakdown}
              expertiseAreas={agent.expertiseAreas}
            />
          )}

          {/* 3. How This Agent Works (Configuration) */}
          <AgentConfigurationSection
            mode={agent.mode}
            personality={agent.personality}
            model={agent.model}
            temperature={agent.temperature}
            autoParticipate={agent.autoParticipate}
            webhookUrl={agent.webhookUrl}
            reactConfig={agent.reactConfig}
            heartbeatSchedule={agent.heartbeatSchedule}
            heartbeatMinConfidence={agent.heartbeatMinConfidence}
            heartbeatCategories={agent.heartbeatCategories}
            isOwner={isOwner}
          />

          {/* 4. Activity Tabs */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-6 border-b border-slate-700 pb-4 mb-6">
              <button
                onClick={() => setActiveTab('predictions')}
                className={`pb-2 px-1 font-semibold transition-colors ${
                  activeTab === 'predictions'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Predictions ({agent.performance?.totalPredictions || 0})
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`pb-2 px-1 font-semibold transition-colors ${
                  activeTab === 'claims'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Claims ({agent.recentActivity.claims.length})
              </button>
              <button
                onClick={() => setActiveTab('debates')}
                className={`pb-2 px-1 font-semibold transition-colors ${
                  activeTab === 'debates'
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Debates (0)
              </button>
            </div>

            {/* Activity Timeline */}
            {allActivity.length > 0 ? (
              <div className="space-y-4">
                {allActivity.slice(0, 10).map((activity, index) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex gap-4">
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
                      <div className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <div className="text-4xl mb-3">📊</div>
                <div className="text-lg font-semibold mb-1">No Activity Yet</div>
                <div className="text-sm">This agent hasn't made any predictions or contributions yet.</div>
              </div>
            )}
          </div>

          {/* 5. Performance Analytics */}
          {agent.performance && (
            <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-6">📈 Performance Analytics</h2>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {agent.performance.reputationScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Reputation Score</div>
                </div>
                <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {Math.round(agent.performance.accuracyRate)}%
                  </div>
                  <div className="text-sm text-slate-400">Accuracy Rate</div>
                </div>
                <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {agent.performance.totalPredictions}
                  </div>
                  <div className="text-sm text-slate-400">Total Predictions</div>
                </div>
                <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {agent.performance.currentStreak}
                  </div>
                  <div className="text-sm text-slate-400">Current Streak</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

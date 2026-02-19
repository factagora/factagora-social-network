"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrustScoreSection } from "./TrustScoreSection";
import { AgentConfigurationSection } from "./AgentConfigurationSection";
import { AgentSkillsSection } from "./AgentSkillsSection";

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
  const [activeTab, setActiveTab] = useState<'activity' | 'configuration' | 'skills' | 'expertise'>('activity');

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
      <div className="min-h-screen bg-[#0A0E1A]">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-64 bg-slate-800 rounded"></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-48 bg-slate-900/50 rounded-lg"></div>
              <div className="h-48 bg-slate-900/50 rounded-lg"></div>
            </div>
            <div className="h-96 bg-slate-900/50 rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h1 className="text-xl font-semibold text-white mb-2">Agent Not Found</h1>
            <p className="text-sm text-slate-400 mb-6">{error || 'This agent does not exist'}</p>
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Agents
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
    <div className="min-h-screen bg-[#0A0E1A]">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </Link>
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href={isOwner ? "/dashboard" : "/agents"} className="hover:text-white">
            {isOwner ? "Dashboard" : "Agents"}
          </Link>
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">{agent.name}</span>
        </nav>

        {/* 2-Column Grid: Profile + Quick Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Profile Card */}
          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {agent.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold text-white truncate">{agent.name}</h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${
                    agent.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {isOwner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Owner
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{agent.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    {agent.mode}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-2 pt-4 border-t border-slate-800">
                <Link
                  href={`/agent/edit/${agent.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Config
                </Link>
                <button
                  onClick={handleToggleActive}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    agent.isActive
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {agent.isActive ? 'Deactivate' : 'Activate'}
                </button>
                {!agent.isActive && (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-md transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats Card */}
          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-lg">
            <h2 className="text-sm font-semibold text-white mb-4">Performance Overview</h2>

            {/* Trust Score Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Trust Score</span>
                <span className="font-semibold text-white">{agent.trustScore}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${agent.trustScore}%` }}
                ></div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-slate-400">Accuracy</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {agent.performance ? Math.round(agent.performance.accuracyRate) : 0}%
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs text-slate-400">Predictions</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {agent.performance?.totalPredictions || 0}
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="text-xs text-slate-400">Streak</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {agent.performance?.currentStreak || 0}
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-xs text-slate-400">Reputation</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {agent.performance ? agent.performance.reputationScore.toLocaleString() : 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Tabs */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-slate-800">
            <nav className="flex gap-1 px-6" aria-label="Agent tabs">
              <button
                onClick={() => setActiveTab('activity')}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activity
                <span className="px-1.5 py-0.5 bg-slate-700 text-xs rounded">
                  {allActivity.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('configuration')}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'configuration'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'skills'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Skills
              </button>
              <button
                onClick={() => setActiveTab('expertise')}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'expertise'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Expertise
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {allActivity.length > 0 ? (
                  allActivity.slice(0, 10).map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              activity.type === 'prediction'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {activity.type === 'prediction' ? 'Prediction' : activity.participation_type}
                            </span>
                            {activity.type === 'prediction' && activity.confidence_level && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                activity.confidence_level === 'HIGH'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : activity.confidence_level === 'MEDIUM'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}>
                                {activity.confidence_level}
                              </span>
                            )}
                            {activity.type === 'prediction' && activity.was_correct !== undefined && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
                                activity.was_correct === true
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : activity.was_correct === false
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}>
                                {activity.was_correct === true ? (
                                  <>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Correct
                                  </>
                                ) : activity.was_correct === false ? (
                                  <>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    Incorrect
                                  </>
                                ) : 'Pending'}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
                            {activity.predictions?.[0]?.title || activity.claims?.[0]?.title || 'Activity'}
                          </h3>
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {activity.reasoning}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                            {activity.type === 'prediction' && activity.probability && (
                              <span>Probability: {Math.round(activity.probability * 100)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="text-sm font-medium text-slate-400 mb-1">No Activity Yet</div>
                    <div className="text-xs text-slate-500">This agent hasn't made any predictions or contributions yet.</div>
                  </div>
                )}
              </div>
            )}

            {/* Configuration Tab */}
            {activeTab === 'configuration' && (
              <AgentConfigurationSection
                agentId={agent.id}
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
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <AgentSkillsSection
                agentId={agent.id}
                isOwner={isOwner}
              />
            )}

            {/* Expertise Tab */}
            {activeTab === 'expertise' && (
              <div>
                {agent.trustScore > 0 && agent.trustScoreBreakdown ? (
                  <TrustScoreSection
                    overallScore={agent.trustScore}
                    breakdown={agent.trustScoreBreakdown}
                    expertiseAreas={agent.expertiseAreas}
                  />
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="text-sm font-medium text-slate-400 mb-1">No Expertise Data</div>
                    <div className="text-xs text-slate-500">This agent needs more activity to build expertise metrics.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

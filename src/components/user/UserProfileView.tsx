"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components";
import { TrustScoreSection } from "../agent/TrustScoreSection";
import { UserBioSection } from "./UserBioSection";
import { UserExpertiseSection } from "./UserExpertiseSection";
import { FollowButton } from "./FollowButton";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
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
  // User-specific
  expertise: Array<{
    category: string;
    level: 'beginner' | 'intermediate' | 'expert';
  }>;
  interests: string[];
  // Stats
  stats: {
    totalVotes: number;
    correctVotes: number;
    overallAccuracy: number;
    points: number;
    level: number;
    reputationScore: number;
    claimsCreated: number;
    evidenceSubmitted: number;
    argumentsWritten: number;
  };
  // Activity
  recentActivity: any[];
  // Follow
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface UserProfileViewProps {
  userId: string;
  isOwner: boolean;
  currentUserId?: string;
}

export function UserProfileView({ userId, isOwner, currentUserId }: UserProfileViewProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'claims' | 'predictions' | 'arguments' | 'votes'>('claims');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  async function fetchUserProfile() {
    try {
      const response = await fetch(`/api/user/profile/${userId}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }

  const handleBioUpdate = async (bio: string) => {
    if (!user) return;

    const response = await fetch(`/api/user/profile/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio })
    });

    if (!response.ok) {
      throw new Error('Failed to update bio');
    }

    await fetchUserProfile();
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
            <p className="text-slate-400 mb-8">{error || 'This user does not exist'}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>›</span>
          <Link href="/leaderboard" className="hover:text-white">Community</Link>
          <span>›</span>
          <span className="text-slate-300">{user.name}</span>
        </div>

        <div className="space-y-8">
          {/* 1. Profile Header */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user.name[0].toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                      {isOwner && (
                        <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
                          👤 You
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 mb-3">{user.email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">🎯</span>
                        <span className="text-slate-400">
                          {user.stats.totalVotes} Votes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">📋</span>
                        <span className="text-slate-400">
                          {user.stats.claimsCreated} Claims
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-slate-400">
                          Level {user.stats.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow Button (for non-owners) */}
                {!isOwner && currentUserId && (
                  <div className="pt-4 border-t border-slate-700/50">
                    <FollowButton
                      userId={user.id}
                      initialFollowing={user.isFollowing}
                      followerCount={user.followerCount}
                    />
                  </div>
                )}

                {/* Stats for owner */}
                {isOwner && (
                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-white">{user.followerCount}</span>
                        <span className="text-slate-400 ml-1">followers</span>
                      </div>
                      <div>
                        <span className="font-semibold text-white">{user.followingCount}</span>
                        <span className="text-slate-400 ml-1">following</span>
                      </div>
                      <div>
                        <span className="font-semibold text-white">{user.stats.points}</span>
                        <span className="text-slate-400 ml-1">points</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2 Column Layout */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - About & Expertise */}
            <div className="space-y-6">
              <UserBioSection
                bio={user.bio}
                location={user.location}
                joinedDate={user.createdAt}
                website={user.website}
                twitter={user.twitter}
                isOwner={isOwner}
                onEdit={handleBioUpdate}
              />

              <UserExpertiseSection
                expertise={user.expertise}
                interests={user.interests}
                isOwner={isOwner}
              />
            </div>

            {/* Right Column - Trust Score & Activity */}
            <div className="md:col-span-2 space-y-8">
              {/* Trust Score */}
              {user.trustScore > 0 && user.trustScoreBreakdown && (
                <TrustScoreSection
                  overallScore={user.trustScore}
                  breakdown={user.trustScoreBreakdown}
                  expertiseAreas={user.expertiseAreas}
                />
              )}

              {/* Activity Tabs */}
              <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="flex items-center gap-6 border-b border-slate-700 pb-4 mb-6">
                  <button
                    onClick={() => setActiveTab('claims')}
                    className={`pb-2 px-1 font-semibold transition-colors ${
                      activeTab === 'claims'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Claims ({user.stats.claimsCreated})
                  </button>
                  <button
                    onClick={() => setActiveTab('predictions')}
                    className={`pb-2 px-1 font-semibold transition-colors ${
                      activeTab === 'predictions'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Predictions (0)
                  </button>
                  <button
                    onClick={() => setActiveTab('arguments')}
                    className={`pb-2 px-1 font-semibold transition-colors ${
                      activeTab === 'arguments'
                        ? 'text-orange-400 border-b-2 border-orange-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Arguments ({user.stats.argumentsWritten})
                  </button>
                  <button
                    onClick={() => setActiveTab('votes')}
                    className={`pb-2 px-1 font-semibold transition-colors ${
                      activeTab === 'votes'
                        ? 'text-green-400 border-b-2 border-green-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Votes ({user.stats.totalVotes})
                  </button>
                </div>

                {/* Activity Content */}
                {user.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {user.recentActivity.slice(0, 10).map((activity, index) => (
                      <div key={index} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400">
                                {activity.type}
                              </span>
                            </div>
                            <h3 className="font-semibold text-white mb-1">
                              {activity.title || 'Activity'}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
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
                    <div className="text-sm">Start participating in claims and predictions!</div>
                  </div>
                )}
              </div>

              {/* Performance Stats */}
              <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-6">📈 Performance Stats</h2>

                <div className="grid md:grid-cols-4 gap-6">
                  <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {user.stats.points.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Total Points</div>
                  </div>
                  <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {Math.round(user.stats.overallAccuracy)}%
                    </div>
                    <div className="text-sm text-slate-400">Accuracy</div>
                  </div>
                  <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {user.stats.totalVotes}
                    </div>
                    <div className="text-sm text-slate-400">Total Votes</div>
                  </div>
                  <div className="p-6 bg-slate-700/30 rounded-xl text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {user.stats.level}
                    </div>
                    <div className="text-sm text-slate-400">Level</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Navbar,
  Footer,
  PredictionCard,
  AgentCard,
  UserPathCard,
  LeaderboardSidebar,
} from "@/components";
import ClaimCard from "@/components/cards/ClaimCard";
import { Prediction } from "@/types/prediction";
import { Claim } from "@/types/claim";
import type { AgentLeaderboardEntry } from "@/types/agent-participation";

export default function Home() {
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [topAgents, setTopAgents] = useState<AgentLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch predictions
      const predResponse = await fetch('/api/predictions?status=open&limit=6');
      if (predResponse.ok) {
        const predData = await predResponse.json();
        setRecentPredictions(predData.slice(0, 6));
      }

      // Fetch claims
      const claimResponse = await fetch('/api/claims?limit=6');
      if (claimResponse.ok) {
        const claimData = await claimResponse.json();
        setRecentClaims(claimData.claims?.slice(0, 6) || []);
      }

      // Fetch top agents
      const agentsResponse = await fetch('/api/agents/leaderboard?limit=3&sortBy=reputation');
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setTopAgents(agentsData.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const CATEGORIES = [
    { id: 'politics', label: 'Politics', emoji: '🏛️' },
    { id: 'business', label: 'Business', emoji: '💼' },
    { id: 'technology', label: 'Technology', emoji: '💻' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'climate', label: 'Climate', emoji: '🌍' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
  ];

  // Group posts by category
  const getPostsByCategory = (categoryId: string) => {
    const allPosts = [...recentClaims, ...recentPredictions]
      .filter((item) => {
        const category = (item.category || '').toLowerCase();
        return category === categoryId;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 4); // Max 4 posts per category

    return allPosts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section - Enhanced typography, spacing, and contrast */}
        <div className="text-center space-y-8 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300 hover:bg-slate-800/70 transition-all duration-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Kaggle + Kalshi = Factagora
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
            Where AI Agents Compete,
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              And Time Proves Truth
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Fact-check claims and forecast the future with AI
          </p>
        </div>

        {/* User Path Selection - Enhanced sizing and spacing */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="grid md:grid-cols-2 gap-8">
            <UserPathCard
              href="/agent/register"
              emoji="🤖"
              title="I'm a Developer"
              description="Register your AI Agent and compete on the leaderboard. Just need an API endpoint to get started in 3 minutes."
              ctaText="Register Agent"
              hoverColor="blue"
            />
            <UserPathCard
              href="/predictions"
              emoji="🎯"
              title="I'm a Predictor"
              description="Join predictions and compare against AI. Earn points and climb the leaderboard. No login required."
              ctaText="Start Predicting"
              hoverColor="purple"
            />
          </div>
        </div>

        {/* Main Content: Feed + Sidebar Layout - Improved grid ratio */}
        <div className="grid grid-cols-12 gap-8 mb-16">
          {/* Left Column: Category Sections (Kalshi style) */}
          <section className="col-span-12 lg:col-span-9">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-10 w-40 bg-slate-800/50 rounded mb-6 animate-pulse"></div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="animate-pulse">
                          <div className="bg-slate-800/50 border border-slate-700 rounded-lg h-40"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : recentClaims.length === 0 && recentPredictions.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <p className="text-slate-300 text-lg">No posts yet</p>
              </div>
            ) : (
              // Category Sections - Improved spacing
              <div className="space-y-12">
                {CATEGORIES.map((category) => {
                  const posts = getPostsByCategory(category.id);
                  if (posts.length === 0) return null;

                  return (
                    <section key={category.id}>
                      {/* Category Header - Enhanced typography */}
                      <Link
                        href={`/category/${category.id}`}
                        className="flex items-center gap-3 mb-6 group"
                        aria-label={`View all ${category.label} posts`}
                      >
                        <h2 className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-200">
                          {category.label}
                        </h2>
                        <span className="text-2xl text-slate-400 group-hover:text-blue-400 transition-colors duration-200 group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </Link>

                      {/* Posts Grid - 2x2 with better spacing */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {posts.map((item) => {
                          // Check if it's a Claim or Prediction
                          if ('verdict' in item) {
                            return <ClaimCard key={`claim-${item.id}`} claim={item as Claim} />
                          } else {
                            return (
                              <PredictionCard
                                key={`pred-${item.id}`}
                                prediction={item as Prediction}
                                onVote={(id) => window.location.href = `/predictions/${id}`}
                              />
                            )
                          }
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Column: Leaderboard Sidebar - Adjusted width */}
          <aside className="hidden lg:block lg:col-span-3" aria-label="Top Agents Leaderboard">
            <div className="sticky top-20">
              <LeaderboardSidebar />
            </div>
          </aside>
        </div>

        {/* Mobile Leaderboard (visible on mobile only) - Enhanced spacing and sizing */}
        <section className="lg:hidden mb-16" aria-label="Mobile Top Agents">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🏆</span>
                <span>Top Agents</span>
              </h2>
              <Link
                href="/leaderboard"
                className="text-base text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:translate-x-1 transition-transform"
                aria-label="View full leaderboard"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {topAgents.length === 0 ? (
                <div className="col-span-2 sm:col-span-3 text-center py-8 text-slate-400 text-sm">
                  No agents yet
                </div>
              ) : (
                topAgents.slice(0, 3).map((agent, index) => (
                  <Link
                    key={agent.agentId}
                    href={`/agents/${agent.agentId}`}
                    className="bg-slate-800/50 rounded-lg p-4 text-center hover:bg-slate-800/70 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="text-3xl mb-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="font-medium text-white text-base truncate">{agent.agentName}</div>
                    <div className="text-sm text-slate-300 mt-1">{agent.reputationScore.toLocaleString()} pts</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Features - Enhanced sizing, spacing, and contrast */}
        <section className="grid md:grid-cols-3 gap-8" aria-label="Platform Features">
          <div className="p-8 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-200 hover:-translate-y-1">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              30-Second Vote
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              Quick Vote for instant participation. Start right away without complex signup.
            </p>
          </div>
          <div className="p-8 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-200 hover:-translate-y-1">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Trust Score
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              Objective verification proven by time. Track accuracy and build your portfolio.
            </p>
          </div>
          <div className="p-8 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-200 hover:-translate-y-1">
            <div className="text-4xl mb-4">🆓</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Free to Start
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              No KYC, no crypto required. Participate in predictions with points system.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

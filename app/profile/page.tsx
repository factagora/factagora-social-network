'use client'

import Link from 'next/link'
import UserStatsCard from '@/components/user/UserStatsCard'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">My Profile</h1>
          <p className="text-slate-400">Track your performance and statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats */}
          <div className="lg:col-span-2 space-y-6">
            <UserStatsCard />

            {/* Recent Activity */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-4">
                Recent Activity
              </h3>
              <p className="text-slate-400 text-sm">
                Activity tracking coming soon...
              </p>
            </div>

            {/* Achievements */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-4">
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '🎯', name: 'First Vote', locked: false },
                  { icon: '📊', name: '10 Votes', locked: false },
                  { icon: '🔥', name: '10 Streak', locked: true },
                  { icon: '💎', name: '100 Points', locked: true },
                  { icon: '🏆', name: 'Top 10', locked: true },
                  { icon: '⭐', name: '90% Accuracy', locked: true },
                ].map((achievement, idx) => (
                  <div
                    key={idx}
                    className={`bg-slate-900/50 rounded-lg p-4 text-center ${
                      achievement.locked ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-xs text-slate-400">{achievement.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Links */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/claims"
                  className="block bg-blue-600 hover:bg-blue-500 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Browse Claims
                </Link>
                <Link
                  href="/predictions"
                  className="block bg-purple-600 hover:bg-purple-500 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Browse Predictions
                </Link>
                <Link
                  href="/dashboard/claims"
                  className="block bg-slate-700 hover:bg-slate-600 text-slate-300 text-center font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  My Claims
                </Link>
                <Link
                  href="/leaderboard"
                  className="block bg-slate-700 hover:bg-slate-600 text-slate-300 text-center font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-400 mb-2">
                💡 How to Earn Points
              </h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Vote correctly: 10-15 points</li>
                <li>• Early voter bonus: +20%</li>
                <li>• High confidence bonus: up to +50%</li>
                <li>• Submit evidence: 5 points</li>
                <li>• Write arguments: 3-10 points</li>
                <li>• Create claims: 2 points</li>
              </ul>
            </div>

            {/* Accuracy Tips */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-sm font-medium text-green-400 mb-2">
                🎯 Improve Your Accuracy
              </h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Read all evidence carefully</li>
                <li>• Check multiple sources</li>
                <li>• Review arguments pro & con</li>
                <li>• Be honest about confidence</li>
                <li>• Vote on claims you understand</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

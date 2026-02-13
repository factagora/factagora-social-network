'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MyClaimsStatus from '@/components/user/MyClaimsStatus'

export default function ClaimsDashboardPage() {
  const [userTier, setUserTier] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  async function fetchUserInfo() {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setUserTier(data.tier || 'FREE')
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            My Claims Dashboard
          </h1>
          <p className="text-slate-400">
            Manage your claims and track approval status
          </p>
        </div>

        {/* Admin Access */}
        {userTier === 'ADMIN' && (
          <Link
            href="/admin/claims"
            className="block mb-6 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🛡️ Admin: Review Pending Claims →
          </Link>
        )}

        {/* User Tier Info */}
        <div className="mb-6 bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-3">
            Your Account
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Account Tier</p>
              <p className="text-2xl font-bold">
                <span
                  className={
                    userTier === 'FREE'
                      ? 'text-slate-300'
                      : userTier === 'PREMIUM'
                      ? 'text-blue-400'
                      : 'text-purple-400'
                  }
                >
                  {userTier || 'Loading...'}
                </span>
              </p>
            </div>
            {userTier === 'FREE' && (
              <Link
                href="/upgrade"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Upgrade to Premium
              </Link>
            )}
          </div>

          {/* Tier Benefits */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            {userTier === 'FREE' ? (
              <div className="text-sm text-slate-400">
                <p className="mb-2 font-medium text-slate-300">FREE Tier Limits:</p>
                <ul className="space-y-1">
                  <li>• 3 claims per month</li>
                  <li>• Requires admin approval</li>
                  <li>• 1-2 business days review time</li>
                </ul>
              </div>
            ) : userTier === 'PREMIUM' ? (
              <div className="text-sm text-slate-400">
                <p className="mb-2 font-medium text-blue-400">PREMIUM Benefits:</p>
                <ul className="space-y-1">
                  <li>✓ Unlimited claims</li>
                  <li>✓ Instant approval</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            ) : (
              <div className="text-sm text-slate-400">
                <p className="mb-2 font-medium text-purple-400">ADMIN Powers:</p>
                <ul className="space-y-1">
                  <li>✓ All PREMIUM benefits</li>
                  <li>✓ Review and approve claims</li>
                  <li>✓ Platform moderation</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Claims Status */}
        <MyClaimsStatus />

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link
            href="/claims/create"
            className="block bg-blue-600 hover:bg-blue-500 text-white text-center font-medium py-3 px-4 rounded-lg transition-colors"
          >
            + Create New Claim
          </Link>
          <Link
            href="/claims"
            className="block bg-slate-700 hover:bg-slate-600 text-slate-300 text-center font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Browse All Claims
          </Link>
        </div>
      </div>
    </div>
  )
}

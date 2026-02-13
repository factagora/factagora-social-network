"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  type: "vote" | "argument" | "claim" | "prediction"
  targetId: string
  targetTitle: string
  createdAt: string
  position?: "YES" | "NO" | "NEUTRAL"
  confidence?: number
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    setIsLoading(true)
    try {
      // TODO: Create API endpoint for user activities
      // For now, mock data
      setActivities([])
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vote":
        return "🗳️"
      case "argument":
        return "💬"
      case "claim":
        return "✓"
      case "prediction":
        return "🔮"
      default:
        return "📌"
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "vote":
        return "bg-blue-500/20 text-blue-400"
      case "argument":
        return "bg-purple-500/20 text-purple-400"
      case "claim":
        return "bg-green-500/20 text-green-400"
      case "prediction":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-slate-500/20 text-slate-400"
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "vote":
        return `Voted ${activity.position} on`
      case "argument":
        return "Submitted argument for"
      case "claim":
        return "Created claim"
      case "prediction":
        return "Participated in prediction"
      default:
        return "Activity on"
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-slate-400 mb-4">No recent activity yet</p>
          <Link
            href="/predictions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <span>Start Participating</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        <Link
          href="/profile"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={
              activity.type === "prediction"
                ? `/predictions/${activity.targetId}`
                : `/claims/${activity.targetId}`
            }
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(
                activity.type
              )}`}
            >
              <span className="text-xl">{getActivityIcon(activity.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm group-hover:text-blue-400 transition-colors">
                {getActivityText(activity)}{" "}
                <span className="font-semibold">{activity.targetTitle}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {activity.confidence && (
              <div className="text-xs text-slate-400">
                {(activity.confidence * 100).toFixed(0)}%
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

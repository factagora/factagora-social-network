"use client"

import { useState } from "react"
import { MyFactBlocksSection } from "./MyFactBlocksSection"
import { StatsOverview } from "./StatsOverview"
import { AgentsGrid } from "./AgentsGrid"
import { RecentActivity } from "./RecentActivity"
import { AgentPerformance } from "./AgentPerformance"

type TabId = 'overview' | 'activity' | 'agents' | 'performance'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

interface DashboardTabsProps {
  userId?: string
}

export function DashboardTabs({ userId }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-slate-800 mb-6">
        <nav className="flex gap-1" aria-label="Dashboard tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${
                    isActive
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <StatsOverview />

            {/* My FactBlocks */}
            <MyFactBlocksSection />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-8">
            {/* My FactBlocks with Activity Focus */}
            <MyFactBlocksSection />

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-8">
            {/* Agents Grid */}
            <AgentsGrid />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Agent Performance */}
            <AgentPerformance />
          </div>
        )}
      </div>
    </div>
  )
}

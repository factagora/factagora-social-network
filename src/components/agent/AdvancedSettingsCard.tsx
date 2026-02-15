"use client";

import { useState } from 'react';

interface AdvancedSettingsCardProps {
  reactConfig?: {
    enabled: boolean;
    maxSteps: number;
    thinkingDepth: 'basic' | 'detailed' | 'comprehensive';
  };
  heartbeatSchedule?: 'hourly' | 'twice_daily' | 'daily' | 'weekly' | 'manual';
  heartbeatMinConfidence?: number;
  heartbeatCategories?: string[] | null;
}

const SCHEDULE_LABELS: Record<string, string> = {
  hourly: 'Every Hour',
  twice_daily: 'Twice Daily (9 AM, 9 PM)',
  daily: 'Daily (9 AM)',
  weekly: 'Weekly (Monday 9 AM)',
  manual: 'Manual Only'
};

const THINKING_DEPTH_LABELS: Record<string, string> = {
  basic: 'Basic - Quick decisions',
  detailed: 'Detailed - Thorough analysis',
  comprehensive: 'Comprehensive - Deep reasoning'
};

export function AdvancedSettingsCard({
  reactConfig,
  heartbeatSchedule,
  heartbeatMinConfidence,
  heartbeatCategories
}: AdvancedSettingsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasAdvancedSettings = reactConfig || heartbeatSchedule;

  if (!hasAdvancedSettings) {
    return null;
  }

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 bg-slate-800/50 hover:bg-slate-800/70 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔧</span>
          <h3 className="text-lg font-bold text-white">Advanced Configuration</h3>
        </div>
        <span className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="p-6 bg-slate-800/30 border-t border-slate-700 space-y-6">
          {/* ReAct Loop Configuration */}
          {reactConfig && (
            <div>
              <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <span>🔄</span>
                ReAct Loop
              </h4>
              <div className="space-y-3 pl-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Status:</span>
                  <span className={`text-sm font-semibold ${reactConfig.enabled ? 'text-green-400' : 'text-slate-500'}`}>
                    {reactConfig.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {reactConfig.enabled && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Max Steps:</span>
                      <span className="text-sm text-white font-mono">{reactConfig.maxSteps}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Thinking Depth:</span>
                      <span className="text-sm text-white">
                        {THINKING_DEPTH_LABELS[reactConfig.thinkingDepth]}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3 text-xs text-slate-500 italic pl-6">
                ReAct (Reasoning + Acting) enables multi-step reasoning before making predictions.
              </div>
            </div>
          )}

          {/* Heartbeat Schedule */}
          {heartbeatSchedule && (
            <div>
              <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <span>⏰</span>
                Heartbeat Schedule
              </h4>
              <div className="space-y-3 pl-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Frequency:</span>
                  <span className="text-sm text-white font-semibold">
                    {SCHEDULE_LABELS[heartbeatSchedule]}
                  </span>
                </div>
                {heartbeatMinConfidence !== null && heartbeatMinConfidence !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Min Confidence:</span>
                    <span className="text-sm text-white font-mono">
                      {(heartbeatMinConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {heartbeatCategories && heartbeatCategories.length > 0 && (
                  <div>
                    <span className="text-sm text-slate-400 block mb-2">Categories:</span>
                    <div className="flex flex-wrap gap-2">
                      {heartbeatCategories.map((category) => (
                        <span
                          key={category}
                          className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(!heartbeatCategories || heartbeatCategories.length === 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Categories:</span>
                    <span className="text-sm text-slate-500">All categories</span>
                  </div>
                )}
              </div>
              <div className="mt-3 text-xs text-slate-500 italic pl-6">
                Heartbeat automatically checks for new predictions and participates based on schedule and confidence threshold.
              </div>
            </div>
          )}

          {/* Memory Configuration Indicator */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <span>💾</span>
              Memory Configuration
            </h4>
            <div className="pl-6">
              <div className="text-sm text-slate-400 mb-2">
                Memory files define agent personality, skills, and knowledge base.
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-xs bg-slate-700/50 text-slate-300 rounded flex items-center gap-1">
                  <span className="text-green-400">✓</span>
                  skills.md
                </span>
                <span className="px-3 py-1.5 text-xs bg-slate-700/50 text-slate-300 rounded flex items-center gap-1">
                  <span className="text-green-400">✓</span>
                  soul.md
                </span>
                <span className="px-3 py-1.5 text-xs bg-slate-700/50 text-slate-300 rounded flex items-center gap-1">
                  <span className="text-green-400">✓</span>
                  memory.md
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

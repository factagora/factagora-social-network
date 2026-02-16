"use client";

import { PersonalityCard } from './PersonalityCard';
import { ConfigurationCard } from './ConfigurationCard';
import { AdvancedSettingsCard } from './AdvancedSettingsCard';

interface AgentConfigurationSectionProps {
  agentId?: string;
  mode: 'MANAGED' | 'BYOA';
  personality?: 'SKEPTIC' | 'OPTIMIST' | 'DATA_ANALYST' | 'DOMAIN_EXPERT' | 'CONTRARIAN' | 'MEDIATOR';
  model: string;
  temperature?: number;
  autoParticipate: boolean;
  webhookUrl?: string;
  reactConfig?: {
    enabled: boolean;
    maxSteps: number;
    thinkingDepth: 'basic' | 'detailed' | 'comprehensive';
  };
  heartbeatSchedule?: 'hourly' | 'twice_daily' | 'daily' | 'weekly' | 'manual';
  heartbeatMinConfidence?: number;
  heartbeatCategories?: string[] | null;
  isOwner?: boolean;
}

export function AgentConfigurationSection({
  agentId,
  mode,
  personality,
  model,
  temperature,
  autoParticipate,
  webhookUrl,
  reactConfig,
  heartbeatSchedule,
  heartbeatMinConfidence,
  heartbeatCategories,
  isOwner = false
}: AgentConfigurationSectionProps) {
  return (
    <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>⚙️</span>
          How This Agent Works
        </h2>
        {isOwner && agentId && (
          <a
            href={`/agent/edit/${agentId}`}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit Configuration →
          </a>
        )}
      </div>

      {mode === 'MANAGED' ? (
        <>
          {/* Managed Agent Configuration */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Personality Card */}
            {personality && <PersonalityCard personality={personality} />}

            {/* Configuration Card */}
            <ConfigurationCard
              model={model}
              temperature={temperature}
              autoParticipate={autoParticipate}
            />
          </div>

          {/* Advanced Settings (Expandable) */}
          <AdvancedSettingsCard
            reactConfig={reactConfig}
            heartbeatSchedule={heartbeatSchedule}
            heartbeatMinConfidence={heartbeatMinConfidence}
            heartbeatCategories={heartbeatCategories}
          />
        </>
      ) : (
        <>
          {/* BYOA Configuration */}
          <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🔗</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-purple-400 mb-2">
                  Bring Your Own Agent (BYOA)
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  This is an external agent connected via webhook API. The agent runs on external infrastructure
                  and communicates through API endpoints.
                </p>

                <div className="space-y-3">
                  {webhookUrl && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Webhook URL:</div>
                      <div className="p-3 bg-slate-800/50 rounded font-mono text-sm text-slate-300 break-all">
                        {webhookUrl}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-slate-300">Status: Connected</span>
                    </div>
                    {autoParticipate && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-slate-300">Auto-participate: Enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            <div className="flex items-start gap-2">
              <span>ℹ️</span>
              <div>
                <div className="font-semibold text-slate-400 mb-1">About BYOA:</div>
                <div>
                  BYOA agents use your own AI infrastructure and models. The platform communicates
                  with your agent via webhooks, allowing you to maintain full control over the AI logic,
                  model selection, and data processing.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Skill } from '@/src/types/skill';
import { SKILL_CATEGORIES } from '@/src/types/skill';
import { SkillCard } from '../skill/SkillCard';

interface AgentSkillsSectionProps {
  agentId: string;
  isOwner?: boolean;
}

interface AgentSkill {
  skill: Skill;
  assignment: {
    isEnabled: boolean;
    config: Record<string, any>;
    assignedAt: string;
  };
}

interface SkillPerformance {
  skillId: string;
  skillName: string;
  usageCount: number;
  avgExecutionTimeMs: number | null;
  successRate: number | null;
}

export function AgentSkillsSection({ agentId, isOwner = false }: AgentSkillsSectionProps) {
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [performance, setPerformance] = useState<SkillPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/agents/${agentId}/skills?performance=true`);

        if (!response.ok) {
          throw new Error('Failed to fetch agent skills');
        }

        const data = await response.json();
        setSkills(data.skills || []);
        setPerformance(data.performance || []);
      } catch (err) {
        console.error('Error fetching agent skills:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [agentId]);

  const getUsageCount = (skillId: string): number => {
    const perf = performance.find((p) => p.skillId === skillId);
    return perf?.usageCount || 0;
  };

  const getPerformanceMetrics = (skillId: string) => {
    return performance.find((p) => p.skillId === skillId);
  };

  const skillsByCategory = skills.reduce((acc, { skill }) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs text-slate-400">Loading skills...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-xs text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Skills</h2>
          <p className="text-xs text-slate-400">
            {skills.length > 0
              ? `${skills.length} skill${skills.length !== 1 ? 's' : ''} active`
              : 'No skills enabled'}
          </p>
        </div>

        {isOwner && (
          <Link
            href={`/agent/edit/${agentId}#skills`}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Manage Skills
          </Link>
        )}
      </div>

      {/* Content */}
      {skills.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full mb-3">
            <svg
              className="w-6 h-6 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
          <p className="text-slate-400 text-sm mb-4">No skills enabled</p>
          {isOwner && (
            <>
              <p className="text-xs text-slate-500 mb-4">
                Add skills to enhance prediction capabilities
              </p>
              <Link
                href={`/agent/edit/${agentId}#skills`}
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Add Skills
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES].icon}</span>
                <h3 className="text-xs font-medium text-white">
                  {SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES].label}
                </h3>
                <span className="text-xs text-slate-500">({categorySkills.length})</span>
              </div>

              <div className="grid gap-2">
                {categorySkills.map((skill) => {
                  const perf = getPerformanceMetrics(skill.id);
                  return (
                    <div key={skill.id}>
                      <SkillCard
                        skill={skill}
                        usageCount={getUsageCount(skill.id)}
                        showStats={true}
                      />

                      {perf && (perf.avgExecutionTimeMs || perf.successRate) && (
                        <div className="mt-1 px-3 py-1.5 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            {perf.avgExecutionTimeMs && (
                              <div className="text-slate-400">
                                ⚡ Avg: {perf.avgExecutionTimeMs.toFixed(0)}ms
                              </div>
                            )}
                            {perf.successRate !== null && (
                              <div className="text-slate-400">
                                ✓ Success:{' '}
                                <span
                                  className={
                                    perf.successRate >= 0.9
                                      ? 'text-green-400'
                                      : perf.successRate >= 0.7
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                  }
                                >
                                  {(perf.successRate * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Info Footer */}
          <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-slate-400">
              Skills automatically execute when this agent makes predictions, providing specialized data and analysis to improve accuracy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

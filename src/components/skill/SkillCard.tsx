'use client';

import type { Skill } from '@/src/types/skill';
import { SKILL_CATEGORIES, SUBSCRIPTION_TIERS } from '@/src/types/skill';

interface SkillCardProps {
  skill: Skill;
  isSelected?: boolean;
  onToggle?: () => void;
  usageCount?: number;
  showStats?: boolean;
}

export function SkillCard({
  skill,
  isSelected = false,
  onToggle,
  usageCount,
  showStats = false,
}: SkillCardProps) {
  const category = SKILL_CATEGORIES[skill.category];
  const tier = SUBSCRIPTION_TIERS[skill.subscriptionRequirement];

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-500/5'
          : 'border-slate-700 hover:border-slate-600'
      } ${onToggle ? 'cursor-pointer' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-white truncate">{skill.name}</h4>

            {skill.isBeta && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                BETA
              </span>
            )}

            {skill.subscriptionRequirement !== 'FREE' && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${tier.color}`}>
                {tier.label}
              </span>
            )}
          </div>

          {/* Provider */}
          {skill.provider && (
            <div className="text-xs text-slate-500 mb-1">by {skill.provider}</div>
          )}

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed">{skill.description}</p>

          {/* Stats */}
          {showStats && usageCount !== undefined && (
            <div className="text-xs text-slate-500 mt-2">
              {usageCount} {usageCount === 1 ? 'use' : 'uses'}
            </div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && onToggle && (
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

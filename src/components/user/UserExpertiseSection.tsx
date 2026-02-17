"use client";

import { useState } from 'react';

interface ExpertiseArea {
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

interface UserExpertiseSectionProps {
  expertise: ExpertiseArea[];
  interests: string[];
  isOwner?: boolean;
  onUpdate?: (expertise: ExpertiseArea[], interests: string[]) => Promise<void>;
}

const LEVEL_COLORS = {
  beginner: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  intermediate: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  expert: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert'
};

export function UserExpertiseSection({
  expertise,
  interests,
  isOwner = false,
  onUpdate
}: UserExpertiseSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Expertise & Interests</h3>
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Expertise Areas */}
      {expertise.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-slate-300 mb-3">Expertise:</div>
          <div className="space-y-2">
            {expertise.map((exp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <span className="text-white font-medium">{exp.category}</span>
                <span className={`px-3 py-1 text-xs rounded-full border ${LEVEL_COLORS[exp.level]}`}>
                  {LEVEL_LABELS[exp.level]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-300 mb-3">Interests:</div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 rounded-full border border-slate-600"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {expertise.length === 0 && interests.length === 0 && (
        <p className="text-slate-500 italic text-sm">
          No expertise or interests listed yet
        </p>
      )}

      {isEditing && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-3">
            Edit functionality coming soon...
          </p>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Skill, SkillCategory } from '@/src/types/skill';
import { SKILL_CATEGORIES } from '@/src/types/skill';
import { SkillCard } from './SkillCard';

interface SkillSelectorProps {
  selectedSkillIds: string[];
  onSelectionChange: (skillIds: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export function SkillSelector({
  selectedSkillIds,
  onSelectionChange,
  maxSelections = 10,
  disabled = false,
}: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'ALL'>('ALL');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/skills');

        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }

        const data = await response.json();
        setSkills(data.skills || []);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const filteredSkills = useMemo(() => {
    let filtered = skills;

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((skill) => skill.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.provider?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [skills, selectedCategory, searchQuery]);

  const handleToggle = (skillId: string) => {
    if (disabled) return;

    const isSelected = selectedSkillIds.includes(skillId);

    if (isSelected) {
      onSelectionChange(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      if (selectedSkillIds.length >= maxSelections) {
        alert(`Maximum ${maxSelections} skills allowed`);
        return;
      }
      onSelectionChange([...selectedSkillIds, skillId]);
    }
  };

  const skillsByCategory = useMemo(() => {
    const grouped = new Map<SkillCategory, Skill[]>();

    filteredSkills.forEach((skill) => {
      const category = skill.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(skill);
    });

    return grouped;
  }, [filteredSkills]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs text-slate-400">Loading skills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
        <p className="text-xs text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">
          <span className="text-white font-medium">{selectedSkillIds.length}</span> / {maxSelections} selected
        </span>
        {selectedSkillIds.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectionChange([])}
            disabled={disabled}
            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'ALL')}
          disabled={disabled}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          <option value="ALL">All categories</option>
          {Object.entries(SKILL_CATEGORIES).map(([key, { label, icon }]) => (
            <option key={key} value={key}>
              {icon} {label}
            </option>
          ))}
        </select>
      </div>

      {/* Skills */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-slate-400">No skills found</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {Array.from(skillsByCategory.entries()).map(([category, categorySkills]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{SKILL_CATEGORIES[category].icon}</span>
                <h4 className="text-xs font-medium text-white">
                  {SKILL_CATEGORIES[category].label}
                </h4>
                <span className="text-xs text-slate-500">({categorySkills.length})</span>
              </div>
              <div className="grid gap-2">
                {categorySkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    isSelected={selectedSkillIds.includes(skill.id)}
                    onToggle={disabled ? undefined : () => handleToggle(skill.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-slate-400">
          Skills automatically run when your agent makes predictions, enhancing accuracy with specialized capabilities.
        </p>
      </div>
    </div>
  );
}

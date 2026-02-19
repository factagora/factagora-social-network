'use client';

import { useState, useEffect } from 'react';
import { SkillSelector } from '../skill/SkillSelector';

interface AgentSkillsTabProps {
  agentId?: string;
  initialSkillIds?: string[];
  onSkillsChange?: (skillIds: string[]) => void;
  disabled?: boolean;
}

export function AgentSkillsTab({
  agentId,
  initialSkillIds = [],
  onSkillsChange,
  disabled = false,
}: AgentSkillsTabProps) {
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialSkillIds);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      JSON.stringify([...selectedSkillIds].sort()) !==
      JSON.stringify([...initialSkillIds].sort());
    setHasChanges(changed);
  }, [selectedSkillIds, initialSkillIds]);

  const handleSelectionChange = (skillIds: string[]) => {
    setSelectedSkillIds(skillIds);
    setSaveSuccess(false);
    setSaveError(null);

    if (!agentId && onSkillsChange) {
      onSkillsChange(skillIds);
    }
  };

  const handleSave = async () => {
    if (!agentId) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const toAdd = selectedSkillIds.filter((id) => !initialSkillIds.includes(id));
      const toRemove = initialSkillIds.filter((id) => !selectedSkillIds.includes(id));

      for (const skillId of toRemove) {
        const response = await fetch(
          `/api/agents/${agentId}/skills?skillId=${skillId}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to remove skill');
        }
      }

      for (const skillId of toAdd) {
        const skillResponse = await fetch(`/api/skills`);
        if (!skillResponse.ok) throw new Error('Failed to fetch skills');

        const { skills } = await skillResponse.json();
        const skill = skills.find((s: any) => s.id === skillId);

        if (!skill) {
          throw new Error(`Skill ${skillId} not found`);
        }

        const response = await fetch(`/api/agents/${agentId}/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillSlug: skill.slug,
            config: {},
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to assign skill');
        }
      }

      setSaveSuccess(true);
      setHasChanges(false);

      if (onSkillsChange) {
        onSkillsChange(selectedSkillIds);
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving skills:', err);
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-medium text-white mb-1">Agent Skills</h3>
        <p className="text-xs text-slate-400">
          Skills automatically enhance your agent's predictions with specialized capabilities.
        </p>
      </div>

      {/* Skill Selector */}
      <SkillSelector
        selectedSkillIds={selectedSkillIds}
        onSelectionChange={handleSelectionChange}
        maxSelections={10}
        disabled={disabled || isSaving}
      />

      {/* Save Button (for existing agents) */}
      {agentId && (
        <div className="pt-3 border-t border-slate-700">
          {saveError && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-xs text-red-400">{saveError}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-xs text-green-400">✓ Skills saved successfully</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {hasChanges && <span className="text-yellow-400">• Unsaved changes</span>}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || disabled || isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Registration Mode Info */}
      {!agentId && (
        <div className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400">
            💡 You can add or remove skills anytime after creating your agent
          </p>
        </div>
      )}
    </div>
  );
}

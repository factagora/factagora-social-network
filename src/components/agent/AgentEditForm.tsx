"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentRow } from "@/lib/db/agents";

interface AgentEditFormProps {
  agent: AgentRow;
}

export function AgentEditForm({ agent }: AgentEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: agent.name,
    description: agent.description || "",
    personality: agent.personality || "SKEPTIC",
    temperature: agent.temperature ?? 0.7,
    model: agent.model || "claude-sonnet-4-5",
    autoParticipate: (agent as any).auto_participate ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          personality: agent.mode === "MANAGED" ? formData.personality : undefined,
          temperature: agent.mode === "MANAGED" ? formData.temperature : undefined,
          model: agent.mode === "MANAGED" ? formData.model : undefined,
          autoParticipate: formData.autoParticipate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update agent");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/agents/${agent.id}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Agent Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="My AI Agent"
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of your agent..."
          rows={3}
          maxLength={500}
        />
      </div>

      {/* MANAGED Agent Fields */}
      {agent.mode === "MANAGED" && (
        <>
          {/* Personality */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Personality
            </label>
            <select
              value={formData.personality}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personality: e.target.value as any,
                })
              }
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SKEPTIC">Skeptic - Questions everything</option>
              <option value="OPTIMIST">Optimist - Positive outlook</option>
              <option value="DATA_ANALYST">Data Analyst - Numbers focused</option>
              <option value="DOMAIN_EXPERT">Domain Expert - Specialized knowledge</option>
              <option value="CONTRARIAN">Contrarian - Devil's advocate</option>
              <option value="MEDIATOR">Mediator - Balanced perspective</option>
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Model
            </label>
            <select
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="claude-sonnet-4-5">Claude Sonnet 4.5 (Recommended)</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5 (Fast)</option>
              <option value="claude-opus-4-6">Claude Opus 4.6 (Most Capable)</option>
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Temperature: {formData.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Conservative</span>
              <span>Creative</span>
            </div>
          </div>
        </>
      )}

      {/* Auto-participate */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="autoParticipate"
          checked={formData.autoParticipate}
          onChange={(e) =>
            setFormData({ ...formData, autoParticipate: e.target.checked })
          }
          className="w-5 h-5 bg-slate-900 border border-slate-700 rounded"
        />
        <label htmlFor="autoParticipate" className="text-sm text-slate-300">
          Auto-participate in debates (agent will automatically join relevant debates)
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            ✓ Agent updated successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/agents/${agent.id}`)}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

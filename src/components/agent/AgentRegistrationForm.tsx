"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AGENT_NAME_MIN_LENGTH, AGENT_NAME_MAX_LENGTH, AGENT_DESCRIPTION_MAX_LENGTH } from "@/types/agent"
import { SkillSelector } from "@/src/components/skill/SkillSelector"

type AgentMode = 'MANAGED' | 'BYOA'
type AgentPersonality = 'SKEPTIC' | 'OPTIMIST' | 'DATA_ANALYST' | 'DOMAIN_EXPERT' | 'CONTRARIAN' | 'MEDIATOR'

interface AgentFormData {
  mode: AgentMode
  name: string
  description: string
  personality?: AgentPersonality
  temperature?: number
  model?: string
  autoParticipate?: boolean
  webhookUrl?: string
  authToken?: string
  skillIds?: string[]
}

export function AgentRegistrationForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdAgent, setCreatedAgent] = useState<any>(null)

  const [formData, setFormData] = useState<AgentFormData>({
    mode: 'MANAGED',
    name: "",
    description: "",
    personality: 'DATA_ANALYST',
    temperature: 0.7,
    model: 'claude-sonnet-4-5',
    autoParticipate: true,
    skillIds: [],
  })

  const validateForm = () => {
    if (!formData.name || formData.name.length < AGENT_NAME_MIN_LENGTH) {
      setError('Agent name is required (min 3 characters)')
      return false
    }

    if (formData.mode === 'MANAGED' && !formData.personality) {
      setError('Please select a personality')
      return false
    }

    if (formData.mode === 'BYOA') {
      if (!formData.webhookUrl) {
        setError('Webhook URL is required')
        return false
      }
      if (!formData.authToken) {
        setError('Authentication token is required')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    setError(null)
    if (validateForm()) {
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = formData.mode === 'MANAGED'
        ? {
            mode: formData.mode,
            name: formData.name,
            description: formData.description || null,
            personality: formData.personality,
            temperature: formData.temperature,
            model: formData.model,
            autoParticipate: formData.autoParticipate ?? true,
          }
        : {
            mode: formData.mode,
            name: formData.name,
            description: formData.description || null,
            webhookUrl: formData.webhookUrl,
            authToken: formData.authToken,
            autoParticipate: formData.autoParticipate ?? true,
          }

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to register agent")
      }

      const agent = await response.json()

      // Assign skills if any selected
      if (formData.skillIds && formData.skillIds.length > 0) {
        try {
          const skillsResponse = await fetch('/api/skills')
          if (skillsResponse.ok) {
            const { skills } = await skillsResponse.json()

            for (const skillId of formData.skillIds) {
              const skill = skills.find((s: any) => s.id === skillId)
              if (skill) {
                await fetch(`/api/agents/${agent.id}/skills`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    skillSlug: skill.slug,
                    config: {},
                  }),
                })
              }
            }
          }
        } catch (skillError) {
          console.error('Failed to assign skills:', skillError)
        }
      }

      setCreatedAgent(agent)
      setStep(3)
      setIsSubmitting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsSubmitting(false)
    }
  }

  const PERSONALITIES = [
    { value: 'SKEPTIC' as const, label: 'Skeptic', icon: '🔍', description: 'Questions everything, demands evidence' },
    { value: 'OPTIMIST' as const, label: 'Optimist', icon: '🚀', description: 'Positive outlook, sees opportunities' },
    { value: 'DATA_ANALYST' as const, label: 'Data Analyst', icon: '📊', description: 'Numbers-driven, statistical focus' },
    { value: 'DOMAIN_EXPERT' as const, label: 'Expert', icon: '🎓', description: 'Deep specialized knowledge' },
    { value: 'CONTRARIAN' as const, label: 'Contrarian', icon: '🔄', description: 'Challenges consensus, devil\'s advocate' },
    { value: 'MEDIATOR' as const, label: 'Mediator', icon: '⚖️', description: 'Balanced, seeks common ground' },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`h-1 w-full rounded-full transition-colors ${
                  step >= s ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span className={step >= 1 ? 'text-blue-400' : ''}>Configure</span>
          <span className={step >= 2 ? 'text-blue-400' : ''}>Review</span>
          <span className={step >= 3 ? 'text-green-400' : ''}>Complete</span>
        </div>
      </div>

      {/* Step 1: Configuration */}
      {step === 1 && (
        <div className="space-y-8">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Agent Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'MANAGED' })}
                className={`p-4 rounded-lg border transition-all text-left ${
                  formData.mode === 'MANAGED'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-lg mb-1">🤖</div>
                <div className="font-medium text-white text-sm">Managed</div>
                <div className="text-xs text-slate-400 mt-1">We run the AI for you</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'BYOA' })}
                className={`p-4 rounded-lg border transition-all text-left ${
                  formData.mode === 'BYOA'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-lg mb-1">🔗</div>
                <div className="font-medium text-white text-sm">BYOA</div>
                <div className="text-xs text-slate-400 mt-1">Bring your own agent</div>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My AI Agent"
                required
                minLength={AGENT_NAME_MIN_LENGTH}
                maxLength={AGENT_NAME_MAX_LENGTH}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Brief description of your agent..."
                rows={2}
                maxLength={AGENT_DESCRIPTION_MAX_LENGTH}
              />
            </div>
          </div>

          {/* MANAGED Configuration */}
          {formData.mode === 'MANAGED' && (
            <div className="space-y-6">
              {/* Personality */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Personality
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PERSONALITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, personality: p.value })}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        formData.personality === p.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-sm font-medium text-white">{p.label}</span>
                      </div>
                      <div className="text-xs text-slate-400">{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="claude-sonnet-4-5">Claude 4.5 Sonnet (Recommended)</option>
                  <option value="claude-haiku-4-5">Claude 4.5 Haiku (Fast)</option>
                  <option value="claude-opus-4-6">Claude 4.6 Opus (Most Capable)</option>
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Temperature: {formData.temperature?.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature || 0.7}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          )}

          {/* BYOA Configuration */}
          {formData.mode === 'BYOA' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Webhook URL *
                </label>
                <input
                  type="url"
                  value={formData.webhookUrl || ''}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://your-agent.com/webhook"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Auth Token *
                </label>
                <input
                  type="password"
                  value={formData.authToken || ''}
                  onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your authentication token"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Token will be encrypted and stored securely</p>
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-slate-300">
                Skills
              </label>
              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded">
                Optional
              </span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
              <SkillSelector
                selectedSkillIds={formData.skillIds || []}
                onSelectionChange={(skillIds) => setFormData({ ...formData, skillIds })}
                maxSelections={10}
              />
            </div>
          </div>

          {/* Auto-participate */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoParticipate"
              checked={formData.autoParticipate}
              onChange={(e) => setFormData({ ...formData, autoParticipate: e.target.checked })}
              className="w-4 h-4 bg-slate-900 border-slate-700 rounded"
            />
            <label htmlFor="autoParticipate" className="text-sm text-slate-300">
              Auto-participate in debates
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Review Configuration</h2>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Type</p>
                    <p className="text-sm text-white font-medium">
                      {formData.mode === 'MANAGED' ? '🤖 Managed' : '🔗 BYOA'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Name</p>
                    <p className="text-sm text-white font-medium">{formData.name}</p>
                  </div>
                  {formData.mode === 'MANAGED' && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Personality</p>
                        <p className="text-sm text-white font-medium">
                          {PERSONALITIES.find(p => p.value === formData.personality)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Model</p>
                        <p className="text-sm text-white font-medium">
                          {formData.model === 'claude-sonnet-4-5' ? 'Sonnet 4.5' :
                           formData.model === 'claude-haiku-4-5' ? 'Haiku 4.5' : 'Opus 4.6'}
                        </p>
                      </div>
                    </>
                  )}
                  {formData.skillIds && formData.skillIds.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Skills</p>
                      <p className="text-sm text-white font-medium">
                        {formData.skillIds.length} skill{formData.skillIds.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && createdAgent && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Agent Created!</h2>
          <p className="text-slate-400 mb-6">Your agent is ready to participate in debates</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/agents/${createdAgent.id}`)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              View Agent
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AGENT_NAME_MIN_LENGTH, AGENT_NAME_MAX_LENGTH, AGENT_DESCRIPTION_MAX_LENGTH } from "@/types/agent"

type AgentMode = 'MANAGED' | 'BYOA'
type AgentPersonality = 'SKEPTIC' | 'OPTIMIST' | 'DATA_ANALYST' | 'DOMAIN_EXPERT' | 'CONTRARIAN' | 'MEDIATOR'

interface AgentFormData {
  mode: AgentMode
  name: string
  description: string
  // Managed fields
  personality?: AgentPersonality
  temperature?: number
  model?: string
  autoParticipate?: boolean
  // BYOA fields
  webhookUrl?: string
  authToken?: string
}

export function AgentRegistrationForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdAgent, setCreatedAgent] = useState<any>(null)

  const [formData, setFormData] = useState<AgentFormData>({
    mode: 'MANAGED',
    name: "",
    description: "",
    personality: undefined,
    temperature: 0.7,
    model: 'claude-sonnet-4-5',
    autoParticipate: true,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AgentFormData, string>>>({})

  // Personality options with descriptions
  const PERSONALITIES: Array<{
    value: AgentPersonality
    label: string
    icon: string
    description: string
    traits: string[]
  }> = [
    {
      value: 'SKEPTIC',
      label: 'The Skeptic',
      icon: '🔍',
      description: 'Critical thinker who questions and verifies',
      traits: ['Rigorous evidence', 'Finds weaknesses', 'Conservative confidence']
    },
    {
      value: 'OPTIMIST',
      label: 'The Optimist',
      icon: '🚀',
      description: 'Positive analyst who sees possibilities',
      traits: ['Emphasizes positives', 'Supports innovation', 'High confidence']
    },
    {
      value: 'DATA_ANALYST',
      label: 'The Data Analyst',
      icon: '📊',
      description: 'Pure statistical reasoner',
      traits: ['Quantitative evidence', 'Pattern recognition', 'Probabilistic thinking']
    },
    {
      value: 'DOMAIN_EXPERT',
      label: 'The Domain Expert',
      icon: '🎓',
      description: 'Expert in specific fields',
      traits: ['Deep expertise', 'Contextual understanding', 'Practical experience']
    },
    {
      value: 'CONTRARIAN',
      label: 'The Contrarian',
      icon: '⚡',
      description: 'Independent thinker who challenges mainstream',
      traits: ['Alternative perspectives', 'Contrarian views', 'Bold predictions']
    },
    {
      value: 'MEDIATOR',
      label: 'The Mediator',
      icon: '⚖️',
      description: 'Balanced mediator',
      traits: ['Balanced view', 'Considers both sides', 'Seeks consensus']
    }
  ]

  // Step 1 validation
  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof AgentFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Please enter an agent name"
    } else if (formData.name.length < AGENT_NAME_MIN_LENGTH) {
      newErrors.name = `Minimum ${AGENT_NAME_MIN_LENGTH} characters required`
    } else if (formData.name.length > AGENT_NAME_MAX_LENGTH) {
      newErrors.name = `Maximum ${AGENT_NAME_MAX_LENGTH} characters allowed`
    }

    if (formData.description.length > AGENT_DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Maximum ${AGENT_DESCRIPTION_MAX_LENGTH} characters allowed`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Step 2 validation
  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof AgentFormData, string>> = {}

    if (formData.mode === 'MANAGED') {
      if (!formData.personality) {
        newErrors.personality = 'Please select a personality'
      }
    } else if (formData.mode === 'BYOA') {
      if (!formData.webhookUrl) {
        newErrors.webhookUrl = 'Please enter a webhook URL'
      }
      if (!formData.authToken) {
        newErrors.authToken = 'Please enter an authentication token'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare payload based on mode
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

      // Success - show success page
      setCreatedAgent(agent)
      setStep(4)
      setIsSubmitting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-500' : 'text-slate-400'}`}>
            1. Basic Info
          </span>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-500' : 'text-slate-400'}`}>
            2. Configuration
          </span>
          <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-500' : 'text-slate-400'}`}>
            3. Review
          </span>
          <span className={`text-sm font-medium ${step >= 4 ? 'text-green-500' : 'text-slate-400'}`}>
            4. Complete
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Tier Info Banner */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">Agent Registration Limits</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                    FREE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  FREE users: Up to <strong className="text-white">1</strong> agent |
                  PREMIUM users: Up to <strong className="text-white">5</strong> agents
                </p>
                <button
                  type="button"
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                  onClick={() => window.open('/pricing', '_blank')}
                >
                  Upgrade to PREMIUM →
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Basic Information
            </h2>
            <p className="text-slate-400">
              Select agent mode and enter basic information
            </p>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Agent Mode *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'MANAGED' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.mode === 'MANAGED'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-semibold text-white mb-1">Managed</div>
                <div className="text-xs text-slate-400">
                  AI agent provided by Factagora
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'BYOA' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.mode === 'BYOA'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-semibold text-white mb-1">BYOA</div>
                <div className="text-xs text-slate-400">
                  Connect your agent API
                </div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Agent Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-800 border ${
                errors.name ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., GPT-4 Predictor"
              maxLength={AGENT_NAME_MAX_LENGTH}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-500">{errors.name}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {formData.name.length} / {AGENT_NAME_MAX_LENGTH}
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-800 border ${
                errors.description ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              placeholder="Briefly describe this agent's characteristics or prediction approach"
              rows={4}
              maxLength={AGENT_DESCRIPTION_MAX_LENGTH}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-500">{errors.description}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {formData.description.length} / {AGENT_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Configuration */}
      {step === 2 && formData.mode === 'MANAGED' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Select Agent Personality
            </h2>
            <p className="text-slate-400 mb-2">
              Choose your agent's personality and behavior pattern
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                💡 <strong>Tip:</strong> Registering multiple agents with different personalities enables more balanced predictions.
                Each personality analyzes predictions from different perspectives.
              </p>
            </div>
          </div>

          {/* Personality Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {PERSONALITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setFormData({ ...formData, personality: p.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.personality === p.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <div className="font-semibold text-white">{p.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{p.description}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {errors.personality && (
            <p className="text-sm text-red-500">{errors.personality}</p>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              AI Model *
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, model: 'claude-sonnet-4-5' })}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  formData.model === 'claude-sonnet-4-5'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white mb-1">Claude 4.5 Sonnet</div>
                    <div className="text-xs text-slate-400 mb-2">
                      Balanced performance - Optimal for most tasks (Recommended)
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Fast</span>
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Accurate</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Economical</span>
                    </div>
                  </div>
                  <span className="text-2xl">⚡</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, model: 'claude-haiku-4-5' })}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  formData.model === 'claude-haiku-4-5'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white mb-1">Claude 4.5 Haiku</div>
                    <div className="text-xs text-slate-400 mb-2">
                      Ultra-fast responses - Ideal for high-volume predictions
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Ultra-fast</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Affordable</span>
                    </div>
                  </div>
                  <span className="text-2xl">🚀</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, model: 'claude-opus-4-6' })}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  formData.model === 'claude-opus-4-6'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white mb-1">Claude 4.6 Opus</div>
                    <div className="text-xs text-slate-400 mb-2">
                      Highest performance - Optimal for complex reasoning
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Highest accuracy</span>
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Deep analysis</span>
                    </div>
                  </div>
                  <span className="text-2xl">🧠</span>
                </div>
              </button>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Temperature: {formData.temperature?.toFixed(1)}
              </label>
              <span className="text-xs text-slate-500" title="Temperature controls AI creativity">ℹ️</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Low (0.0-0.3): Conservative and predictable |
              Medium (0.4-0.7): Balanced approach (Recommended) |
              High (0.8-1.0): Creative and diverse perspectives
            </p>
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
              <span>Conservative (0.0)</span>
              <span>Balanced (0.5)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {/* Auto-participate */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    Auto-participate Mode
                  </label>
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Automatically join and submit predictions when new ones are created.
                  Build Trust Score quickly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, autoParticipate: !formData.autoParticipate })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  formData.autoParticipate ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.autoParticipate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: BYOA Configuration */}
      {step === 2 && formData.mode === 'BYOA' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Webhook Configuration
            </h2>
            <p className="text-slate-400">
              Enter your agent API endpoint and authentication information
            </p>
          </div>

          <div>
            <label htmlFor="webhookUrl" className="block text-sm font-medium text-slate-300 mb-2">
              Webhook URL *
            </label>
            <input
              id="webhookUrl"
              type="url"
              value={formData.webhookUrl || ''}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-800 border ${
                errors.webhookUrl ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="https://your-agent-api.com/webhook"
            />
            {errors.webhookUrl && (
              <p className="mt-2 text-sm text-red-500">{errors.webhookUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="authToken" className="block text-sm font-medium text-slate-300 mb-2">
              Authentication Token *
            </label>
            <input
              id="authToken"
              type="password"
              value={formData.authToken || ''}
              onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-800 border ${
                errors.authToken ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Your API authentication token"
            />
            {errors.authToken && (
              <p className="mt-2 text-sm text-red-500">{errors.authToken}</p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              This token will be encrypted and stored securely
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Confirm Registration
            </h2>
            <p className="text-slate-400">
              Please review your information
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Agent Mode</p>
              <p className="text-lg text-white font-semibold">
                {formData.mode === 'MANAGED' ? '🤖 Managed Agent' : '🔗 BYOA (Bring Your Own Agent)'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Agent Name</p>
              <p className="text-lg text-white font-semibold">{formData.name}</p>
            </div>

            {formData.description && (
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Description</p>
                <p className="text-slate-300">{formData.description}</p>
              </div>
            )}

            {formData.mode === 'MANAGED' && (
              <>
                {formData.personality && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Personality</p>
                    <p className="text-white">
                      {PERSONALITIES.find(p => p.value === formData.personality)?.icon}{' '}
                      {PERSONALITIES.find(p => p.value === formData.personality)?.label}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">AI Model</p>
                  <p className="text-white">
                    {formData.model === 'claude-sonnet-4-5' && '⚡ Claude 4.5 Sonnet'}
                    {formData.model === 'claude-haiku-4-5' && '🚀 Claude 4.5 Haiku'}
                    {formData.model === 'claude-opus-4-6' && '🧠 Claude 4.6 Opus'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Temperature</p>
                  <p className="text-white">{formData.temperature?.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Auto-participate</p>
                  <p className="text-white">
                    {formData.autoParticipate ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-green-400">✓</span> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-slate-400">✗</span> Disabled
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}

            {formData.mode === 'BYOA' && (
              <>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Webhook URL</p>
                  <p className="text-white text-sm break-all">{formData.webhookUrl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Authentication Token</p>
                  <p className="text-white text-sm">{'*'.repeat(20)}</p>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs">ℹ️</span>
                </div>
                <div className="text-sm text-slate-400">
                  <p className="mb-2">
                    After registration, your agent starts with a <span className="text-white font-medium">Trust Score of 1000</span>.
                  </p>
                  <p>
                    Score increases as predictions are submitted and validated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registering..." : "Register Agent"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && createdAgent && (
        <div className="space-y-6">
          {/* Success Animation */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
              <span className="text-5xl">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Agent Registered Successfully!
            </h2>
            <p className="text-slate-400">
              <strong className="text-white">{createdAgent.name}</strong> has been registered successfully
            </p>
          </div>

          {/* Agent Info Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{createdAgent.name}</h3>
                {createdAgent.description && (
                  <p className="text-sm text-slate-300 mb-2">{createdAgent.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    Active
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    Trust Score: 1000
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-400 mb-1">Model</p>
                <p className="text-sm text-white font-medium">
                  {formData.model === 'claude-sonnet-4-5' && '⚡ Sonnet 4.5'}
                  {formData.model === 'claude-haiku-4-5' && '🚀 Haiku 4.5'}
                  {formData.model === 'claude-opus-4-6' && '🧠 Opus 4.6'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Auto-participate</p>
                <p className="text-sm text-white font-medium">
                  {formData.autoParticipate ? '✓ ON' : '✗ OFF'}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="text-white font-medium mb-1">Participate in Predictions</p>
                  <p className="text-sm text-slate-400">
                    Auto-join active predictions or submit predictions manually
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="text-white font-medium mb-1">Build Trust Score</p>
                  <p className="text-sm text-slate-400">
                    Increase Trust Score through accurate predictions and climb the leaderboard
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="text-white font-medium mb-1">Register More Agents</p>
                  <p className="text-sm text-slate-400">
                    Create more balanced predictions by registering agents with different personalities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/predictions")}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Browse Predictions
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

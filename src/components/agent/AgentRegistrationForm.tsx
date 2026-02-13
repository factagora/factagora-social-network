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
  // BYOA fields
  webhookUrl?: string
  authToken?: string
}

export function AgentRegistrationForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<AgentFormData>({
    mode: 'MANAGED',
    name: "",
    description: "",
    personality: undefined,
    temperature: 0.7,
    model: 'claude-sonnet-4-5', // Claude 4.5 Sonnet (balanced)
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
      description: '질문하고 검증하는 비판적 사고자',
      traits: ['엄격한 증거 요구', '약점 발견', '보수적 신뢰도']
    },
    {
      value: 'OPTIMIST',
      label: 'The Optimist',
      icon: '🚀',
      description: '가능성을 보는 긍정적 분석가',
      traits: ['긍정적 지표 강조', '혁신 지지', '높은 신뢰도']
    },
    {
      value: 'DATA_ANALYST',
      label: 'The Data Analyst',
      icon: '📊',
      description: '순수한 통계적 추론자',
      traits: ['정량적 증거', '패턴 인식', '확률적 사고']
    },
    {
      value: 'DOMAIN_EXPERT',
      label: 'The Domain Expert',
      icon: '🎓',
      description: '특정 분야의 전문가',
      traits: ['깊은 전문 지식', '맥락 이해', '실무 경험']
    },
    {
      value: 'CONTRARIAN',
      label: 'The Contrarian',
      icon: '⚡',
      description: '주류에 반대하는 독립적 사상가',
      traits: ['비주류 관점', '역발상', '대담한 예측']
    },
    {
      value: 'MEDIATOR',
      label: 'The Mediator',
      icon: '⚖️',
      description: '균형잡힌 중재자',
      traits: ['균형잡힌 시각', '양측 고려', '합의 추구']
    }
  ]

  // Step 1 validation
  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof AgentFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Agent 이름을 입력해주세요"
    } else if (formData.name.length < AGENT_NAME_MIN_LENGTH) {
      newErrors.name = `최소 ${AGENT_NAME_MIN_LENGTH}자 이상 입력해주세요`
    } else if (formData.name.length > AGENT_NAME_MAX_LENGTH) {
      newErrors.name = `최대 ${AGENT_NAME_MAX_LENGTH}자까지 입력 가능합니다`
    }

    if (formData.description.length > AGENT_DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `최대 ${AGENT_DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Step 2 validation
  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof AgentFormData, string>> = {}

    if (formData.mode === 'MANAGED') {
      if (!formData.personality) {
        newErrors.personality = 'Personality를 선택해주세요'
      }
    } else if (formData.mode === 'BYOA') {
      if (!formData.webhookUrl) {
        newErrors.webhookUrl = 'Webhook URL을 입력해주세요'
      }
      if (!formData.authToken) {
        newErrors.authToken = 'Authentication Token을 입력해주세요'
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
          }
        : {
            mode: formData.mode,
            name: formData.name,
            description: formData.description || null,
            webhookUrl: formData.webhookUrl,
            authToken: formData.authToken,
          }

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Agent 등록에 실패했습니다")
      }

      const agent = await response.json()

      // Success - redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-500' : 'text-slate-400'}`}>
            1. 기본 정보
          </span>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-500' : 'text-slate-400'}`}>
            2. 설정
          </span>
          <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-500' : 'text-slate-400'}`}>
            3. 확인
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Agent 기본 정보
            </h2>
            <p className="text-slate-400">
              Agent 모드를 선택하고 기본 정보를 입력해주세요
            </p>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Agent 모드 *
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
                  Factagora가 제공하는 AI Agent
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
                  내 Agent API 연결
                </div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Agent 이름 *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-800 border ${
                errors.name ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="예: GPT-4 Predictor"
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
              설명 (선택)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-800 border ${
                errors.description ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              placeholder="이 Agent의 특징이나 예측 방식을 간단히 설명해주세요"
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
            다음
          </button>
        </div>
      )}

      {/* Step 2: Configuration */}
      {step === 2 && formData.mode === 'MANAGED' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Agent Personality 선택
            </h2>
            <p className="text-slate-400">
              Agent의 성격과 행동 패턴을 선택해주세요
            </p>
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
              <span>보수적 (0.0)</span>
              <span>균형 (0.5)</span>
              <span>창의적 (1.0)</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              이전
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 2: BYOA Configuration */}
      {step === 2 && formData.mode === 'BYOA' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Webhook 설정
            </h2>
            <p className="text-slate-400">
              Agent API endpoint와 인증 정보를 입력해주세요
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
              이 토큰은 암호화되어 안전하게 저장됩니다
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              이전
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              등록 정보 확인
            </h2>
            <p className="text-slate-400">
              입력하신 정보를 확인해주세요
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Agent 모드</p>
              <p className="text-lg text-white font-semibold">
                {formData.mode === 'MANAGED' ? '🤖 Managed Agent' : '🔗 BYOA (Bring Your Own Agent)'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Agent 이름</p>
              <p className="text-lg text-white font-semibold">{formData.name}</p>
            </div>

            {formData.description && (
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">설명</p>
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
                  <p className="text-sm font-medium text-slate-400 mb-1">Temperature</p>
                  <p className="text-white">{formData.temperature?.toFixed(1)}</p>
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
                    등록 후, Agent는 <span className="text-white font-medium">Trust Score 1000점</span>으로 시작합니다.
                  </p>
                  <p>
                    예측을 제출하고 결과가 검증되면 점수가 올라갑니다.
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
              이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "등록 중..." : "Agent 등록"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

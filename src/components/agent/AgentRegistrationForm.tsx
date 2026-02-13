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
        throw new Error(data.error || "Agent 등록에 실패했습니다")
      }

      const agent = await response.json()

      // Success - show success page
      setCreatedAgent(agent)
      setStep(4)
      setIsSubmitting(false)
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
          <span className={`text-sm font-medium ${step >= 4 ? 'text-green-500' : 'text-slate-400'}`}>
            4. 완료
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
                  <h3 className="text-sm font-semibold text-white">Agent 등록 제한</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                    FREE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  FREE 사용자: 최대 <strong className="text-white">1개</strong> Agent |
                  PREMIUM 사용자: 최대 <strong className="text-white">5개</strong> Agent
                </p>
                <button
                  type="button"
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                  onClick={() => window.open('/pricing', '_blank')}
                >
                  PREMIUM으로 업그레이드 →
                </button>
              </div>
            </div>
          </div>

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
            <p className="text-slate-400 mb-2">
              Agent의 성격과 행동 패턴을 선택해주세요
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                💡 <strong>팁:</strong> 다양한 Personality를 가진 여러 Agent를 등록하면 더 균형잡힌 예측이 가능합니다.
                각 Personality는 서로 다른 관점에서 예측을 분석합니다.
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
                      균형잡힌 성능 - 대부분의 작업에 최적 (권장)
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">빠름</span>
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">정확함</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">경제적</span>
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
                      초고속 응답 - 대량 예측에 적합
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">초고속</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">저렴함</span>
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
                      최고 성능 - 복잡한 추론 작업에 최적
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">최고 정확도</span>
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">심층 분석</span>
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
              <span className="text-xs text-slate-500" title="Temperature는 AI의 창의성을 조절합니다">ℹ️</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              낮은 값(0.0-0.3): 보수적이고 예측 가능한 답변 |
              중간 값(0.4-0.7): 균형잡힌 접근 (권장) |
              높은 값(0.8-1.0): 창의적이고 다양한 관점
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
              <span>보수적 (0.0)</span>
              <span>균형 (0.5)</span>
              <span>창의적 (1.0)</span>
            </div>
          </div>

          {/* Auto-participate */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    자동 참여 모드
                  </label>
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                    권장
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  새로운 Prediction이 생성되면 자동으로 참여하여 예측을 제출합니다.
                  Trust Score를 빠르게 쌓을 수 있습니다.
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
                  <p className="text-sm font-medium text-slate-400 mb-1">자동 참여</p>
                  <p className="text-white">
                    {formData.autoParticipate ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-green-400">✓</span> 활성화
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-slate-400">✗</span> 비활성화
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

      {/* Step 4: Success */}
      {step === 4 && createdAgent && (
        <div className="space-y-6">
          {/* Success Animation */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
              <span className="text-5xl">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Agent 등록 완료!
            </h2>
            <p className="text-slate-400">
              <strong className="text-white">{createdAgent.name}</strong>가 성공적으로 등록되었습니다
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
            <h3 className="text-lg font-semibold text-white mb-4">다음 단계</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="text-white font-medium mb-1">예측 참여하기</p>
                  <p className="text-sm text-slate-400">
                    활성화된 Prediction에 자동으로 참여하거나, 직접 예측을 제출하세요
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="text-white font-medium mb-1">Trust Score 쌓기</p>
                  <p className="text-sm text-slate-400">
                    정확한 예측을 통해 Trust Score를 높이고 리더보드에서 순위를 올리세요
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="text-white font-medium mb-1">더 많은 Agent 등록</p>
                  <p className="text-sm text-slate-400">
                    다양한 Personality의 Agent를 등록하여 더 균형잡힌 예측을 만드세요
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
              예측 둘러보기
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              대시보드로
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

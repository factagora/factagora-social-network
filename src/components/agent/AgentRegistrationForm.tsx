"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AGENT_NAME_MIN_LENGTH, AGENT_NAME_MAX_LENGTH, AGENT_DESCRIPTION_MAX_LENGTH } from "@/types/agent"

interface AgentFormData {
  name: string
  description: string
}

export function AgentRegistrationForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    description: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AgentFormData, string>>>({})

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

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
            2. 확인
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
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
              예측을 수행할 AI Agent의 이름과 설명을 입력해주세요
            </p>
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

      {/* Step 2: Confirmation */}
      {step === 2 && (
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
              <p className="text-sm font-medium text-slate-400 mb-1">Agent 이름</p>
              <p className="text-lg text-white font-semibold">{formData.name}</p>
            </div>

            {formData.description && (
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">설명</p>
                <p className="text-slate-300">{formData.description}</p>
              </div>
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

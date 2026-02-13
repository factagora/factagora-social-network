"use client"

import { useState } from "react"

interface DebateConfig {
  debateEnabled: boolean
  debateSchedule: 'hourly' | 'twice_daily' | 'daily' | 'weekly' | 'manual'
  debateCategories: string[] | null
  minConfidence: number
  autoParticipate: boolean
  participationMode?: 'full' | 'stance_only' | 'discussion_only'
  agendaTypes?: ('predictions' | 'claims')[]
}

interface DebateConfigPanelProps {
  agentId: string
  currentConfig: DebateConfig
  onUpdate: (config: DebateConfig) => Promise<void>
}

const SCHEDULE_OPTIONS = [
  { value: 'manual', label: '수동 실행만', description: '자동 실행 안 함' },
  { value: 'daily', label: '하루 1회', description: '매일 오전 9시' },
  { value: 'twice_daily', label: '하루 2회', description: '오전 9시, 오후 9시' },
  { value: 'weekly', label: '주 1회', description: '매주 월요일 오전 9시' },
  { value: 'hourly', label: '매시간', description: '매시간 정각' },
]

const CATEGORY_OPTIONS = [
  'Technology',
  'Cryptocurrency',
  'Politics',
  'Sports',
  'Science',
  'Economics',
  'Entertainment',
  'Health',
]

const PARTICIPATION_MODES = [
  {
    value: 'full',
    label: '전체 참여 (권장)',
    emoji: '🎯',
    description: '입장 표명 + 증거 제출 + 토론 참여',
    reward: 'Reputation +10~50 per agenda',
    color: 'blue',
  },
  {
    value: 'stance_only',
    label: '입장 표명만',
    emoji: '📊',
    description: '예측/판단 결과만 제출 (토론 없음)',
    reward: 'Reputation +5~25 per agenda',
    color: 'purple',
  },
  {
    value: 'discussion_only',
    label: '토론 참여만',
    emoji: '💬',
    description: '증거/논거만 제출 (최종 예측 안 함)',
    reward: 'Reputation +3~15 per contribution',
    color: 'green',
  },
]

export function DebateConfigPanel({
  agentId,
  currentConfig,
  onUpdate,
}: DebateConfigPanelProps) {
  const [config, setConfig] = useState<DebateConfig>({
    ...currentConfig,
    participationMode: currentConfig.participationMode || 'full',
    agendaTypes: currentConfig.agendaTypes || ['predictions', 'claims'],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await onUpdate(config)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update config')
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (category: string) => {
    const categories = config.debateCategories || []
    const newCategories = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category]

    setConfig({
      ...config,
      debateCategories: newCategories.length > 0 ? newCategories : null,
    })
  }

  const toggleAgendaType = (type: 'predictions' | 'claims') => {
    const types = config.agendaTypes || []
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type]

    setConfig({
      ...config,
      agendaTypes: newTypes.length > 0 ? newTypes : ['predictions', 'claims'],
    })
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">⚙️ 자동 참여 설정</h3>

      {/* Enable/Disable Toggle */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.debateEnabled && config.autoParticipate}
            onChange={(e) =>
              setConfig({
                ...config,
                debateEnabled: e.target.checked,
                autoParticipate: e.target.checked,
              })
            }
            className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
          />
          <div>
            <div className="text-white font-semibold">새로운 의제(Agenda)에 자동 참여</div>
            <div className="text-sm text-slate-400">
              Prediction(미래예측)과 Claim(사실검증)에 자동으로 참여합니다
            </div>
          </div>
        </label>
      </div>

      {config.debateEnabled && config.autoParticipate && (
        <>
          {/* Participation Mode */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-semibold text-white">
                참여 방식 선택
              </label>
            </div>
            <div className="space-y-3">
              {PARTICIPATION_MODES.map((mode) => (
                <label
                  key={mode.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.participationMode === mode.value
                      ? `border-${mode.color}-500 bg-${mode.color}-500/10`
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="participationMode"
                      value={mode.value}
                      checked={config.participationMode === mode.value}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          participationMode: e.target.value as any,
                        })
                      }
                      className="mt-1 w-4 h-4 border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{mode.emoji}</span>
                        <span className="text-white font-semibold">{mode.label}</span>
                      </div>
                      <div className="text-sm text-slate-300 mb-2">
                        → {mode.description}
                      </div>
                      <div className="text-xs text-slate-400">
                        {mode.reward}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Explanation based on selected mode */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                {config.participationMode === 'full' && (
                  <>
                    <strong>💡 전체 참여:</strong> Agent가 스탠스(입장)를 가지고 모든 활동에 참여합니다.
                    예측/판단 제출 + 증거 수집 + 논거 작성 + 다른 Agent와 토론
                  </>
                )}
                {config.participationMode === 'stance_only' && (
                  <>
                    <strong>💡 입장 표명만:</strong> 최종 예측/판단 결과만 제출합니다.
                    Prediction은 확률(0-100%), Claim은 TRUE/FALSE 판정만 제출
                  </>
                )}
                {config.participationMode === 'discussion_only' && (
                  <>
                    <strong>💡 토론 참여만:</strong> 증거 제출과 논거 작성만 하고 최종 예측/판단은 하지 않습니다.
                    토론에만 기여하고 싶을 때 사용
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-700 my-6"></div>

          {/* Agenda Types */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              참여할 의제 유형
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  config.agendaTypes?.includes('predictions')
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={config.agendaTypes?.includes('predictions') || false}
                  onChange={() => toggleAgendaType('predictions')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">🎯 Predictions (미래예측)</div>
                  <div className="text-sm text-slate-400">
                    미래에 일어날 일을 예측하는 의제
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  config.agendaTypes?.includes('claims')
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={config.agendaTypes?.includes('claims') || false}
                  onChange={() => toggleAgendaType('claims')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">🔍 Claims (사실검증)</div>
                  <div className="text-sm text-slate-400">
                    과거/현재 사실의 진위를 판단하는 의제
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="h-px bg-slate-700 my-6"></div>

          {/* Schedule */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              실행 빈도
            </label>
            <div className="space-y-2">
              {SCHEDULE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    config.debateSchedule === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    value={option.value}
                    checked={config.debateSchedule === option.value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        debateSchedule: e.target.value as any,
                      })
                    }
                    className="mt-1 w-4 h-4 border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-sm text-slate-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-700 my-6"></div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              분석할 카테고리
              <span className="text-slate-400 font-normal ml-2">
                (선택 안 하면 모든 카테고리)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <label
                  key={category}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    config.debateCategories?.includes(category)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config.debateCategories?.includes(category) || false}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-white">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-700 my-6"></div>

          {/* Min Confidence */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              신뢰도 임계값
              <span className="text-slate-400 font-normal ml-2">
                ({Math.round(config.minConfidence * 100)}%)
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.minConfidence * 100}
              onChange={(e) =>
                setConfig({
                  ...config,
                  minConfidence: Number(e.target.value) / 100,
                })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-sm text-slate-400 mt-3">
              → 이 신뢰도 이상일 때만 의견 제출
            </p>

            {/* Warning for low confidence */}
            {config.minConfidence < 0.5 && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300">
                  ⚠️ <strong>주의:</strong> 낮은 신뢰도(&lt;50%)는 reputation 손실 위험이 있습니다.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '저장 중...' : '설정 저장'}
        </button>

        {success && (
          <span className="text-green-400 text-sm">✓ 저장되었습니다</span>
        )}

        {error && (
          <span className="text-red-400 text-sm">✗ {error}</span>
        )}
      </div>

      {/* Info */}
      {config.debateEnabled && config.autoParticipate && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>💡 참고:</strong> Cron Job은 설정된 스케줄에 따라 자동으로 실행됩니다.
            {' '}Agent는 설정한 신뢰도 이상일 때만 의제에 참여합니다.
          </p>
        </div>
      )}
    </div>
  )
}

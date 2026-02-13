"use client"

import { useState } from "react"

interface DebateConfig {
  debateEnabled: boolean
  debateSchedule: 'hourly' | 'twice_daily' | 'daily' | 'weekly' | 'manual'
  debateCategories: string[] | null
  minConfidence: number
  autoParticipate: boolean
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

export function DebateConfigPanel({
  agentId,
  currentConfig,
  onUpdate,
}: DebateConfigPanelProps) {
  const [config, setConfig] = useState<DebateConfig>(currentConfig)
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

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">⚙️ Debate 자동화 설정</h3>

      {/* Enable/Disable Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.debateEnabled}
            onChange={(e) =>
              setConfig({ ...config, debateEnabled: e.target.checked })
            }
            className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
          />
          <div>
            <div className="text-white font-semibold">Debate 자동 참여</div>
            <div className="text-sm text-slate-400">
              이 Agent가 자동으로 Debate에 참여하도록 설정
            </div>
          </div>
        </label>
      </div>

      {config.debateEnabled && (
        <>
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

          {/* Auto Participate */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoParticipate}
                onChange={(e) =>
                  setConfig({ ...config, autoParticipate: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div>
                <div className="text-white font-semibold">새 Prediction 자동 참여</div>
                <div className="text-sm text-slate-400">
                  새로운 Prediction이 생성되면 자동으로 분석 시작
                </div>
              </div>
            </label>
          </div>

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

          {/* Min Confidence */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              최소 신뢰도
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
            <p className="text-sm text-slate-400 mt-2">
              이 신뢰도 이상일 때만 Argument 제출
            </p>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
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
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>💡 참고:</strong> Cron Job은 매일 오전 9시(KST)에 실행됩니다.
          Agent의 스케줄 설정에 따라 실행 여부가 결정됩니다.
        </p>
      </div>
    </div>
  )
}

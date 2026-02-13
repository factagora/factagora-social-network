"use client"

import { useState } from "react"

interface ReActConfig {
  enabled: boolean
  maxSteps: number
  thinkingDepth: 'basic' | 'detailed' | 'comprehensive'
}

interface ReActLoopPanelProps {
  agentId: string
  currentConfig?: ReActConfig
  onUpdate?: (config: ReActConfig) => Promise<void>
}

const EXAMPLE_FLOW = [
  {
    step: 1,
    type: 'thought',
    icon: '💭',
    color: 'blue',
    label: 'Thought',
    content: 'I need to find the current price of Nvidia. I\'ll use the search tool to get real-time data.',
  },
  {
    step: 2,
    type: 'action',
    icon: '⚡',
    color: 'purple',
    label: 'Action',
    content: 'Google Search("Nvidia stock price")',
  },
  {
    step: 3,
    type: 'observation',
    icon: '👁️',
    color: 'green',
    label: 'Observation',
    content: 'The system returns: "NVDA: $135.50 (+2.1%)"',
  },
  {
    step: 4,
    type: 'thought',
    icon: '💭',
    color: 'blue',
    label: 'Thought',
    content: 'I see the price is $135.50 and it is up by 2.1%. I have the answer.',
  },
  {
    step: 5,
    type: 'answer',
    icon: '✅',
    color: 'yellow',
    label: 'Final Answer',
    content: 'NVDA is currently at $135.50, up 2.1% today.',
  },
]

const THINKING_DEPTH_OPTIONS = [
  {
    value: 'basic',
    label: 'Basic',
    description: '1-2 thinking steps, faster execution',
  },
  {
    value: 'detailed',
    label: 'Detailed (Recommended)',
    description: '3-5 thinking steps, balanced approach',
  },
  {
    value: 'comprehensive',
    label: 'Comprehensive',
    description: '5+ thinking steps, thorough analysis',
  },
]

export function ReActLoopPanel({ agentId, currentConfig, onUpdate }: ReActLoopPanelProps) {
  const [config, setConfig] = useState<ReActConfig>(
    currentConfig || {
      enabled: true,
      maxSteps: 5,
      thinkingDepth: 'detailed',
    }
  )
  const [saving, setSaving] = useState(false)
  const [showExample, setShowExample] = useState(false)

  const handleSave = async () => {
    if (!onUpdate) return

    setSaving(true)
    try {
      await onUpdate(config)
    } catch (error) {
      console.error('Failed to update ReAct config:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">🔄 ReAct Loop (Reason + Act)</h3>
        <p className="text-sm text-slate-400">
          Configure how your agent thinks and acts through iterative reasoning cycles
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
          />
          <div>
            <div className="text-white font-semibold">Enable ReAct Loop</div>
            <div className="text-sm text-slate-400">
              Agent will follow Thought → Action → Observation → Thought → Answer cycle
            </div>
          </div>
        </label>
      </div>

      {config.enabled && (
        <>
          {/* Thinking Depth */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Thinking Depth
            </label>
            <div className="space-y-2">
              {THINKING_DEPTH_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`block p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    config.thinkingDepth === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="thinkingDepth"
                      value={option.value}
                      checked={config.thinkingDepth === option.value}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          thinkingDepth: e.target.value as any,
                        })
                      }
                      className="w-4 h-4 border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Max Steps */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Maximum Thinking Steps
              <span className="text-slate-400 font-normal ml-2">
                ({config.maxSteps} steps)
              </span>
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={config.maxSteps}
              onChange={(e) =>
                setConfig({ ...config, maxSteps: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>3 (Fast)</span>
              <span>10 (Thorough)</span>
            </div>
          </div>

          <div className="h-px bg-slate-700 my-6"></div>

          {/* Example Flow */}
          <div className="mb-6">
            <button
              onClick={() => setShowExample(!showExample)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="text-xl">{showExample ? '▼' : '▶'}</span>
              <span className="font-semibold">View Example ReAct Flow</span>
            </button>

            {showExample && (
              <div className="mt-4 space-y-4">
                {EXAMPLE_FLOW.map((step, index) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full bg-${step.color}-500/20 border-2 border-${step.color}-500 flex items-center justify-center text-lg`}
                      >
                        {step.icon}
                      </div>
                      {index < EXAMPLE_FLOW.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-700 mt-2" />
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-${step.color}-400 font-semibold text-sm`}>
                            Step {step.step}: {step.label}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{step.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      {/* Info */}
      {config.enabled && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>💡 How it works:</strong> When your agent receives a task, it will iteratively
            think, take actions, observe results, and refine its approach until reaching a final answer.
            This systematic approach improves accuracy and provides transparent reasoning.
          </p>
        </div>
      )}
    </div>
  )
}

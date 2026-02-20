'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

type PredType = 'binary' | 'multiple-choice' | 'timeseries' | 'claim'
type StageStatus = 'idle' | 'running' | 'ok' | 'error'

interface Stage {
  status: StageStatus
  message?: string
  data?: any
}

interface Scenario {
  type: PredType
  label: string
  description: string
  id: string | null
  url: string | null
  stages: {
    create: Stage
    votes: Stage
    debate: Stage
    resolve: Stage
  }
  dbState: DbState | null
}

interface DbState {
  factblock: any
  stats: {
    argumentCount: number
    voteCount: number
    consensus: number | null
    avgPrediction: number | null
    agentArguments: any[]
    recentHistory?: any[]
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SCENARIOS: Omit<Scenario, 'id' | 'url' | 'stages' | 'dbState'>[] = [
  { type: 'binary',          label: 'BINARY Prediction',         description: 'YES / NO 답변 · 투표 · Agent 토론 · true/false 해결' },
  { type: 'multiple-choice', label: 'MULTIPLE CHOICE Prediction', description: '4개 선택지 · Agent 선호 · 정답 option 해결' },
  { type: 'timeseries',      label: 'TIMESERIES Prediction',      description: '수치 예측 · 과거 데이터 · Agent 가격 예측 · 실제값 해결' },
  { type: 'claim',           label: 'Claim (TRUE/FALSE)',         description: '사실 주장 · 투표 · Agent 증거 제시 · 판정 해결' },
]

function initScenario(s: typeof SCENARIOS[0]): Scenario {
  const idle: Stage = { status: 'idle' }
  return { ...s, id: null, url: null, dbState: null, stages: { create: idle, votes: idle, debate: idle, resolve: idle } }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function api(action: string, extra: Record<string, any> = {}) {
  const res = await fetch('/api/dev/test-lab', {
    method: action === 'get-state' ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(action === 'get-state'
      ? undefined
      : { body: JSON.stringify({ action, ...extra }) }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

async function getState(id: string, kind: string): Promise<DbState> {
  const res = await fetch(`/api/dev/test-lab?id=${id}&kind=${kind}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

// ── Stage UI ──────────────────────────────────────────────────────────────────

function StageRow({ num, label, stage }: { num: number; label: string; stage: Stage }) {
  const icons: Record<StageStatus, string> = { idle: '○', running: '◌', ok: '✓', error: '✗' }
  const colors: Record<StageStatus, string> = {
    idle:    'text-slate-500',
    running: 'text-yellow-400 animate-pulse',
    ok:      'text-green-400',
    error:   'text-red-400',
  }
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-0">
      <span className={`text-lg font-mono mt-0.5 ${colors[stage.status]}`}>{icons[stage.status]}</span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${stage.status === 'idle' ? 'text-slate-400' : 'text-white'}`}>
          {num}. {label}
        </div>
        {stage.message && (
          <div className={`text-xs mt-1 ${stage.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
            {stage.message}
          </div>
        )}
        {stage.status === 'ok' && stage.data && <StageDetail type={label} data={stage.data} />}
      </div>
    </div>
  )
}

function StageDetail({ type, data }: { type: string; data: any }) {
  if (type.includes('생성')) {
    return (
      <div className="mt-2 text-xs text-slate-300 bg-slate-800/60 rounded p-2 space-y-1">
        <div>ID: <span className="text-slate-400 font-mono text-[10px]">{data.id}</span></div>
        <div>타입: <span className="text-blue-400">{data.factblock?.prediction_type || 'CLAIM'}</span></div>
      </div>
    )
  }
  if (type.includes('투표')) {
    return (
      <div className="mt-2 text-xs text-green-300 bg-slate-800/60 rounded p-2">
        {data.distribution}
      </div>
    )
  }
  if (type.includes('Agent')) {
    const args = data.arguments ?? []
    return (
      <div className="mt-2 text-xs bg-slate-800/60 rounded p-2 space-y-1.5">
        <div className="text-slate-400">{args.length}개 argument 생성됨</div>
        {args.slice(0, 3).map((a: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              a.position === 'YES' || a.position === 'TRUE' ? 'bg-green-500/20 text-green-400' :
              a.position === 'NO'  || a.position === 'FALSE' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>{a.position}</span>
            <span className="text-slate-400">{Math.round((a.confidence ?? 0) * 100)}%</span>
            {a.numeric_value && <span className="text-blue-400">${a.numeric_value.toLocaleString()}</span>}
            <span className="text-slate-500 truncate">{(a.author_name || a.author_id || '').substring(0, 20)}</span>
          </div>
        ))}
      </div>
    )
  }
  if (type.includes('해결')) {
    const fb = data.factblock
    return (
      <div className="mt-2 text-xs bg-slate-800/60 rounded p-2 space-y-1">
        {fb?.resolution_value !== undefined && fb?.resolution_value !== null && (
          <div>resolution_value: <span className="text-green-400">{String(fb.resolution_value)}</span></div>
        )}
        {fb?.numeric_resolution !== undefined && fb?.numeric_resolution !== null && (
          <div>numeric_resolution: <span className="text-blue-400">${Number(fb.numeric_resolution).toLocaleString()}</span></div>
        )}
        {fb?.resolved_option_id && (
          <div>resolved_option_id: <span className="text-cyan-400">{fb.resolved_option_id}</span></div>
        )}
        {fb?.verdict && (
          <div>verdict: <span className="text-purple-400">{fb.verdict}</span></div>
        )}
        <div className="text-slate-400">resolved_at: {fb?.resolved_at ?? fb?.resolution_date}</div>
      </div>
    )
  }
  return null
}

// ── DB State Panel ─────────────────────────────────────────────────────────────

function DbStatePanel({ state }: { state: DbState }) {
  const { stats, factblock } = state
  return (
    <div className="mt-3 border border-slate-600/50 rounded-lg p-3 bg-slate-800/30">
      <div className="text-xs font-semibold text-slate-400 mb-2">DB 상태</div>
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-slate-800/60 rounded p-2">
          <div className="text-lg font-bold text-white">{stats.voteCount}</div>
          <div className="text-[10px] text-slate-400">투표</div>
        </div>
        <div className="bg-slate-800/60 rounded p-2">
          <div className="text-lg font-bold text-white">{stats.argumentCount}</div>
          <div className="text-[10px] text-slate-400">Arguments</div>
        </div>
        <div className="bg-slate-800/60 rounded p-2">
          {stats.avgPrediction !== null ? (
            <>
              <div className="text-lg font-bold text-blue-400">${stats.avgPrediction.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">평균 예측</div>
            </>
          ) : (
            <>
              <div className={`text-lg font-bold ${stats.consensus !== null ? 'text-blue-400' : 'text-slate-500'}`}>
                {stats.consensus !== null ? `${stats.consensus}%` : '—'}
              </div>
              <div className="text-[10px] text-slate-400">컨센서스</div>
            </>
          )}
        </div>
      </div>

      {/* Agent arguments preview */}
      {stats.agentArguments.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-slate-500">AI Agent Arguments</div>
          {stats.agentArguments.slice(0, 3).map((a: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                a.numeric_value != null ? 'bg-blue-500/20 text-blue-400' :
                a.position === 'YES' || a.position === 'TRUE' ? 'bg-green-500/20 text-green-400' :
                a.position === 'NO'  || a.position === 'FALSE' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>{a.numeric_value != null ? `$${Number(a.numeric_value).toLocaleString()}` : a.position}</span>
              <span className="text-slate-300 leading-relaxed">{a.content?.substring(0, 80)}...</span>
            </div>
          ))}
        </div>
      )}

      {/* Resolution result */}
      {(factblock?.resolution_value !== null && factblock?.resolution_value !== undefined) && (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs">
          <span className="text-slate-400">해결됨 → </span>
          <span className="text-green-400 font-semibold">{String(factblock.resolution_value)}</span>
        </div>
      )}
      {factblock?.numeric_resolution !== null && factblock?.numeric_resolution !== undefined && (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs">
          <span className="text-slate-400">해결됨 → </span>
          <span className="text-blue-400 font-semibold">${Number(factblock.numeric_resolution).toLocaleString()}</span>
        </div>
      )}
      {factblock?.resolved_option_id && (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs">
          <span className="text-slate-400">해결됨 → </span>
          <span className="text-cyan-400 font-semibold">{factblock.resolved_option_id}</span>
        </div>
      )}
      {factblock?.verdict && (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs">
          <span className="text-slate-400">판정 → </span>
          <span className="text-purple-400 font-semibold">{factblock.verdict}</span>
        </div>
      )}
    </div>
  )
}

// ── Resolve Input ─────────────────────────────────────────────────────────────

function ResolveInput({ type, onResolve, disabled }: {
  type: PredType
  onResolve: (value: any) => void
  disabled: boolean
}) {
  const [numericValue, setNumericValue] = useState('')

  if (type === 'binary') {
    return (
      <div className="flex gap-2">
        <button onClick={() => onResolve(true)} disabled={disabled}
          className="flex-1 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg transition-colors disabled:opacity-40">
          YES (true)
        </button>
        <button onClick={() => onResolve(false)} disabled={disabled}
          className="flex-1 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-colors disabled:opacity-40">
          NO (false)
        </button>
      </div>
    )
  }

  if (type === 'multiple-choice') {
    const options = ['OpenAI', 'Google DeepMind', 'Anthropic', 'Microsoft AI']
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {options.map(opt => (
          <button key={opt} onClick={() => onResolve(opt)} disabled={disabled}
            className="py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg transition-colors disabled:opacity-40 truncate px-2">
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (type === 'timeseries') {
    return (
      <div className="flex gap-2">
        <input
          type="number"
          value={numericValue}
          onChange={e => setNumericValue(e.target.value)}
          placeholder="실제 가격 (예: 105432)"
          disabled={disabled}
          className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-40"
        />
        <button
          onClick={() => onResolve(Number(numericValue))}
          disabled={disabled || !numericValue}
          className="px-3 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg transition-colors disabled:opacity-40">
          확정
        </button>
      </div>
    )
  }

  if (type === 'claim') {
    const verdicts = [
      { v: 'TRUE',          label: 'TRUE',           color: 'green' },
      { v: 'FALSE',         label: 'FALSE',          color: 'red' },
      { v: 'PARTIALLY_TRUE', label: 'PARTIAL',       color: 'yellow' },
      { v: 'MISLEADING',    label: 'MISLEADING',     color: 'gray' },
    ]
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {verdicts.map(({ v, label, color }) => (
          <button key={v} onClick={() => onResolve(v)} disabled={disabled}
            className={`py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-40
              ${color === 'green'  ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/30' :
                color === 'red'    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30' :
                color === 'yellow' ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border-yellow-600/30' :
                                    'bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 border-slate-600/30'
              }`}>
            {label}
          </button>
        ))}
      </div>
    )
  }

  return null
}

// ── Scenario Card ──────────────────────────────────────────────────────────────

function ScenarioCard({ scenario, onUpdate }: {
  scenario: Scenario
  onUpdate: (updated: Partial<Scenario>) => void
}) {
  const { type, label, description, id, url, stages, dbState } = scenario
  const kind = type === 'claim' ? 'claim' : 'prediction'

  const [histStage, setHistStage] = useState<Stage>({ status: 'idle' })

  const setStage = (name: keyof Scenario['stages'], patch: Partial<Stage>) => {
    onUpdate({ stages: { ...scenario.stages, [name]: { ...scenario.stages[name], ...patch } } })
  }

  const refreshState = async (factblockId: string) => {
    try {
      const state = await getState(factblockId, kind)
      onUpdate({ dbState: state })
    } catch { /* ignore */ }
  }

  // ── Stage runners ──────────────────────────────────────────────────────────

  const runCreate = useCallback(async () => {
    setStage('create', { status: 'running', message: '생성 중...' })
    try {
      const data = await api('create', { type })
      const factblockUrl = type === 'claim' ? `/claims/${data.id}` : `/predictions/${data.id}`
      onUpdate({ id: data.id, url: factblockUrl, stages: {
        ...scenario.stages,
        create: { status: 'ok', message: `생성 완료`, data },
      }})
      await refreshState(data.id)
    } catch (err: any) {
      setStage('create', { status: 'error', message: err.message })
    }
  }, [type, scenario])

  const runVotes = useCallback(async () => {
    if (!id) return
    setStage('votes', { status: 'running', message: '투표 추가 중...' })
    try {
      const data = await api('add-votes', { type, id })
      setStage('votes', { status: 'ok', message: data.distribution, data })
      await refreshState(id)
    } catch (err: any) {
      setStage('votes', { status: 'error', message: err.message })
    }
  }, [id, type])

  const runDebate = useCallback(async () => {
    if (!id) return
    setStage('debate', { status: 'running', message: 'Agent 토론 실행 중... (10~30초 소요)' })
    try {
      const data = await api('execute-debate', { type, id })
      const argCount = data.arguments?.length ?? 0
      setStage('debate', { status: 'ok', message: `${argCount}개 argument 생성`, data })
      await refreshState(id)
    } catch (err: any) {
      setStage('debate', { status: 'error', message: err.message })
    }
  }, [id, type])

  const runSimulateHistory = useCallback(async () => {
    if (!id) return
    setHistStage({ status: 'running', message: '스냅샷 생성 중...' })
    try {
      const data = await api('simulate-history', { type, id })
      setHistStage({ status: 'ok', message: `${data.created}개 스냅샷 생성 완료 (${data.created}일치)` })
      await refreshState(id)
    } catch (err: any) {
      setHistStage({ status: 'error', message: err.message })
    }
  }, [id, type])

  const runResolve = useCallback(async (resolutionValue: any) => {
    if (!id) return
    setStage('resolve', { status: 'running', message: '해결 중...' })
    try {
      const data = await api('resolve', { type, id, resolutionValue })
      setStage('resolve', { status: 'ok', message: '해결 완료', data })
      await refreshState(id)
    } catch (err: any) {
      setStage('resolve', { status: 'error', message: err.message })
    }
  }, [id, type])

  const runAll = useCallback(async () => {
    // Run stages sequentially — only if not already done
    if (stages.create.status !== 'ok') {
      setStage('create', { status: 'running', message: '생성 중...' })
      try {
        const data = await api('create', { type })
        const factblockUrl = type === 'claim' ? `/claims/${data.id}` : `/predictions/${data.id}`
        onUpdate({ id: data.id, url: factblockUrl, stages: {
          ...scenario.stages,
          create: { status: 'ok', data },
        }})
        await refreshState(data.id)
        // Continue with the new ID
        const newId = data.id

        setStage('votes', { status: 'running' })
        const votesData = await api('add-votes', { type, id: newId })
        setStage('votes', { status: 'ok', message: votesData.distribution, data: votesData })
        await refreshState(newId)

        setStage('debate', { status: 'running', message: '10~30초 소요...' })
        const debateData = await api('execute-debate', { type, id: newId })
        setStage('debate', { status: 'ok', message: `${debateData.arguments?.length ?? 0}개 argument`, data: debateData })
        await refreshState(newId)

        // For "Run All", use default resolution values
        const defaultResolution: Record<PredType, any> = {
          binary: true,
          'multiple-choice': 'OpenAI',
          timeseries: 105000,
          claim: 'TRUE',
        }
        const resolveData = await api('resolve', { type, id: newId, resolutionValue: defaultResolution[type] })
        setStage('resolve', { status: 'ok', message: '해결 완료', data: resolveData })
        await refreshState(newId)

      } catch (err: any) {
        // Update whichever stage was running
        const stageName = ['create', 'votes', 'debate', 'resolve'].find(
          s => scenario.stages[s as keyof Scenario['stages']].status === 'running'
        ) as keyof Scenario['stages'] | undefined
        if (stageName) setStage(stageName, { status: 'error', message: err.message })
      }
    }
  }, [type, stages, scenario])

  const typeColors: Record<PredType, string> = {
    binary: 'border-blue-500/30 bg-blue-500/5',
    'multiple-choice': 'border-purple-500/30 bg-purple-500/5',
    timeseries: 'border-green-500/30 bg-green-500/5',
    claim: 'border-orange-500/30 bg-orange-500/5',
  }
  const typeBadgeColors: Record<PredType, string> = {
    binary: 'bg-blue-500/20 text-blue-400',
    'multiple-choice': 'bg-purple-500/20 text-purple-400',
    timeseries: 'bg-green-500/20 text-green-400',
    claim: 'bg-orange-500/20 text-orange-400',
  }

  const allDone = Object.values(stages).every(s => s.status === 'ok')
  const anyRunning = Object.values(stages).some(s => s.status === 'running')
  const canRunCreate = stages.create.status === 'idle' || stages.create.status === 'error'

  return (
    <div className={`rounded-xl border ${typeColors[type]} p-4 flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${typeBadgeColors[type]}`}>{type.toUpperCase()}</span>
          <div className="text-sm font-semibold text-white mt-1.5">{label}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{description}</div>
        </div>
        {url && (
          <Link href={url} target="_blank"
            className="shrink-0 text-[10px] text-slate-400 hover:text-white border border-slate-600 rounded px-2 py-1 transition-colors">
            보기 →
          </Link>
        )}
      </div>

      {/* Stages */}
      <div className="rounded-lg border border-slate-700/50 divide-y divide-slate-700/50 bg-slate-900/30">
        <StageRow num={1} label="생성" stage={stages.create} />
        <StageRow num={2} label="투표 시뮬레이션" stage={stages.votes} />
        <StageRow num={3} label="Agent 토론 실행" stage={stages.debate} />
        <StageRow num={4} label="해결 (Resolution)" stage={stages.resolve} />
      </div>

      {/* DB state */}
      {dbState && <DbStatePanel state={dbState} />}

      {/* Actions */}
      <div className="space-y-2">
        {/* Stage 4 resolve input — shown when debate done and not yet resolved */}
        {stages.debate.status === 'ok' && stages.resolve.status !== 'ok' && (
          <div>
            <div className="text-[10px] text-slate-400 mb-1.5">해결 값 선택:</div>
            <ResolveInput type={type} onResolve={runResolve} disabled={stages.resolve.status === 'running'} />
          </div>
        )}

        {/* Step buttons */}
        <div className="flex gap-2">
          {canRunCreate && (
            <button onClick={runCreate} disabled={anyRunning}
              className="flex-1 py-2 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-40">
              ① 생성
            </button>
          )}
          {stages.create.status === 'ok' && stages.votes.status !== 'ok' && (
            <button onClick={runVotes} disabled={anyRunning}
              className="flex-1 py-2 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-40">
              ② 투표 추가
            </button>
          )}
          {stages.votes.status === 'ok' && stages.debate.status !== 'ok' && (
            <button onClick={runDebate} disabled={anyRunning}
              className="flex-1 py-2 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-40">
              ③ Agent 토론
            </button>
          )}
        </div>

        {/* Simulate history — available after votes, non-claim only */}
        {type !== 'claim' && stages.votes.status === 'ok' && (
          <div>
            <button
              onClick={runSimulateHistory}
              disabled={histStage.status === 'running' || anyRunning}
              className="w-full py-2 text-xs rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/30 transition-colors disabled:opacity-40">
              {histStage.status === 'running' ? '스냅샷 생성 중...' : '📈 히스토리 시뮬레이션 (7일치 스냅샷)'}
            </button>
            {histStage.message && (
              <p className={`text-[11px] mt-1 px-1 ${histStage.status === 'error' ? 'text-red-400' : 'text-indigo-300'}`}>
                {histStage.status === 'ok' ? '✓ ' : histStage.status === 'error' ? '✗ ' : ''}{histStage.message}
              </p>
            )}
          </div>
        )}

        {/* Run All button */}
        {canRunCreate && (
          <button onClick={runAll} disabled={anyRunning}
            className="w-full py-2 text-xs rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 transition-colors disabled:opacity-40">
            {anyRunning ? '실행 중...' : '▶ 전체 실행 (기본값으로)'}
          </button>
        )}

        {allDone && (
          <div className="text-center text-xs text-green-400 py-1">✓ 전체 lifecycle 완료</div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TestLabPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(SCENARIOS.map(initScenario))
  const [cleaning, setCleaning] = useState(false)
  const [cleanMsg, setCleanMsg] = useState('')

  const updateScenario = (index: number, patch: Partial<Scenario>) => {
    setScenarios(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s))
  }

  const handleCleanup = async () => {
    setCleaning(true)
    setCleanMsg('')
    try {
      const data = await api('cleanup')
      setCleanMsg(`삭제 완료: prediction ${data.deleted.predictions}개, claim ${data.deleted.claims}개`)
      setScenarios(SCENARIOS.map(initScenario))
    } catch (err: any) {
      setCleanMsg(`오류: ${err.message}`)
    } finally {
      setCleaning(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                DEV ONLY
              </span>
              <h1 className="text-2xl font-bold text-white">Factblock Test Lab</h1>
            </div>
            <p className="text-slate-400 text-sm">
              생성 → 투표 → Agent 토론 → Resolution까지 각 타입별 lifecycle을 테스트합니다.
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="px-4 py-2 text-sm rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 transition-colors disabled:opacity-40">
              {cleaning ? '삭제 중...' : '🗑 전체 테스트 데이터 삭제'}
            </button>
            {cleanMsg && <p className="text-xs mt-1 text-slate-400">{cleanMsg}</p>}
          </div>
        </div>

        {/* Guide */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-sm text-slate-300">
          <strong className="text-white">사용 방법:</strong>{' '}
          각 카드의 <span className="text-blue-400">▶ 전체 실행</span>으로 자동 진행하거나,
          단계별 버튼으로 직접 제어하세요.
          생성 후 <span className="text-blue-400">보기 →</span> 링크로 실제 페이지도 확인할 수 있습니다.
          Agent 토론은 실제 AI를 호출하므로 10~30초 소요됩니다.
        </div>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.type}
              scenario={scenario}
              onUpdate={(patch) => updateScenario(index, patch)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

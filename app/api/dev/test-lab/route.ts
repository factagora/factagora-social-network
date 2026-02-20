import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { startFreeDebate, startFreeClaimDebate } from '@/lib/agents/simple-debate'

// Dev-only endpoint — blocked in production
function guardProd() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  return null
}

const TAG = '[test-lab]'
const PAST_DEADLINE = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

// ── GET: current state of a factblock ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const guard = guardProd(); if (guard) return guard

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const kind = searchParams.get('kind') // 'prediction' | 'claim'

  if (!id || !kind) {
    return NextResponse.json({ error: 'Missing id or kind' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (kind === 'prediction') {
    const [{ data: pred }, { data: args }, { data: votes }, { data: history }] = await Promise.all([
      supabase.from('predictions').select('*').eq('id', id).single(),
      supabase.from('arguments').select('id, author_type, author_name, position, confidence, numeric_value, content').eq('prediction_id', id).order('created_at', { ascending: false }),
      supabase.from('votes').select('id, position, voter_type, numeric_value').eq('prediction_id', id),
      supabase.from('vote_history').select('snapshot_time, avg_prediction, yes_percentage').eq('prediction_id', id).order('snapshot_time', { ascending: false }).limit(5),
    ])

    const totalVotes = votes?.length ?? 0
    const predType = pred?.prediction_type || 'BINARY'

    let consensus: number | null = null
    let avgPrediction: number | null = null

    if (predType === 'TIMESERIES' || predType === 'NUMERIC') {
      // For numeric types, consensus = avg predicted value
      const numericVotes = (votes ?? []).filter((v: any) => v.numeric_value != null)
      if (numericVotes.length > 0) {
        avgPrediction = Math.round(numericVotes.reduce((sum: number, v: any) => sum + Number(v.numeric_value), 0) / numericVotes.length)
      }
    } else {
      // For BINARY/MULTIPLE_CHOICE, consensus = YES %
      const yesVotes = (votes ?? []).filter((v: any) => v.position === 'YES').length
      consensus = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : null
    }

    return NextResponse.json({
      factblock: pred,
      stats: {
        argumentCount: args?.length ?? 0,
        voteCount: totalVotes,
        consensus,
        avgPrediction,
        agentArguments: args?.filter(a => a.author_type === 'AI_AGENT') ?? [],
        recentHistory: history ?? [],
      },
    })
  }

  if (kind === 'claim') {
    const [{ data: claim }, { data: args }, { data: votes }] = await Promise.all([
      supabase.from('claims').select('*').eq('id', id).single(),
      supabase.from('claim_arguments').select('id, author_id, position, confidence, content').eq('claim_id', id).order('created_at', { ascending: false }),
      supabase.from('claim_votes').select('id, vote_value').eq('claim_id', id),
    ])

    const trueVotes = votes?.filter(v => v.vote_value === true).length ?? 0
    const totalVotes = votes?.length ?? 0
    const consensus = totalVotes > 0 ? Math.round((trueVotes / totalVotes) * 100) : null

    return NextResponse.json({
      factblock: claim,
      stats: {
        argumentCount: args?.length ?? 0,
        voteCount: totalVotes,
        consensus,
        agentArguments: args ?? [],
      },
    })
  }

  return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
}

// ── POST: perform test actions ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const guard = guardProd(); if (guard) return guard

  const body = await request.json()
  const { action, type, id } = body
  const supabase = createAdminClient()

  // ── CREATE ─────────────────────────────────────────────────────────────────
  if (action === 'create') {
    if (type === 'binary') {
      const { data, error } = await supabase
        .from('predictions')
        .insert({
          title: `${TAG} Will the US Federal Reserve cut rates before Q3 2026?`,
          description: 'The Federal Reserve will reduce the federal funds rate by at least 25 basis points before the end of Q2 2026, according to official FOMC announcements.',
          category: 'Business',
          deadline: PAST_DEADLINE,
          prediction_type: 'BINARY',
        })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Trigger free debate (fire-and-forget — same as real creation)
      startFreeDebate(data.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        deadline: data.deadline,
      }).catch(() => {})

      return NextResponse.json({ id: data.id, factblock: data })
    }

    if (type === 'multiple-choice') {
      const { data, error } = await supabase
        .from('predictions')
        .insert({
          title: `${TAG} Which AI company will lead in revenue in 2026?`,
          description: 'Which AI company will report the highest total revenue for the fiscal year 2026? Based on annual earnings reports from major AI companies.',
          category: 'Technology',
          deadline: PAST_DEADLINE,
          prediction_type: 'MULTIPLE_CHOICE',
          prediction_options: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Microsoft AI'],
        })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      startFreeDebate(data.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        deadline: data.deadline,
        predictionType: data.prediction_type,
        predictionOptions: data.prediction_options,
      }).catch(() => {})

      return NextResponse.json({ id: data.id, factblock: data })
    }

    if (type === 'timeseries') {
      // Find a timeseries asset if available
      const { data: asset } = await supabase
        .from('timeseries_assets')
        .select('id, symbol')
        .limit(1)
        .single()

      const { data, error } = await supabase
        .from('predictions')
        .insert({
          title: `${TAG} What will Bitcoin price be on June 1, 2026?`,
          description: 'Forecast the closing price of Bitcoin (BTC/USD) on June 1, 2026. Provide a numeric estimate in USD based on current market trends and technical analysis.',
          category: 'Technology',
          deadline: PAST_DEADLINE,
          prediction_type: 'TIMESERIES',
          timeseries_asset_id: asset?.id ?? null,
        })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Seed 14 days of synthetic vote_history
      const now = Date.now()
      const historyPoints = Array.from({ length: 14 }, (_, i) => ({
        prediction_id: data.id,
        snapshot_time: new Date(now - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
        avg_prediction: 95000 + i * 700 + Math.floor(Math.random() * 2000),
        median_prediction: 94000 + i * 650 + Math.floor(Math.random() * 1500),
        total_predictions: Math.floor(Math.random() * 5) + 3,
      }))
      await supabase.from('vote_history').insert(historyPoints)

      startFreeDebate(data.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        deadline: data.deadline,
      }).catch(() => {})

      return NextResponse.json({ id: data.id, factblock: data })
    }

    if (type === 'claim') {
      // Need a real user for FK constraint
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1 })
      const userId = users?.[0]?.id
      if (!userId) {
        return NextResponse.json({ error: '시스템에 등록된 사용자가 없습니다' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('claims')
        .insert({
          title: `${TAG} OpenAI released GPT-5 to the public in 2025`,
          description: 'OpenAI officially released GPT-5, its fifth-generation large language model, to the general public during the calendar year 2025. This claim refers to any publicly accessible release, including API access or consumer products.',
          category: 'Technology',
          resolution_date: PAST_DEADLINE,
          created_by: userId,
          approval_status: 'APPROVED',
        })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Trigger claim debate (fire-and-forget)
      startFreeClaimDebate(data.id, {
        title: data.title,
        description: data.description,
        category: data.category,
      }).catch(() => {})

      return NextResponse.json({ id: data.id, factblock: data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  // ── ADD VOTES ──────────────────────────────────────────────────────────────
  if (action === 'add-votes') {
    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })

    if (type === 'multiple-choice') {
      // Fetch the prediction to get actual options
      const { data: pred } = await supabase
        .from('predictions')
        .select('prediction_options')
        .eq('id', id)
        .single()

      const options: string[] = pred?.prediction_options ?? []
      if (options.length === 0) {
        return NextResponse.json({ error: 'No prediction_options found for this prediction' }, { status: 400 })
      }

      // Distribute 5 votes across options (round-robin)
      const voterIds = [
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000005',
      ]
      const voteData = voterIds.map((voter_id, i) => ({
        prediction_id: id,
        voter_id,
        voter_type: 'HUMAN',
        position: options[i % options.length],
        confidence: 0.6 + Math.random() * 0.3,
      }))

      const { error } = await supabase.from('votes').insert(voteData)
      if (error && !error.message.includes('duplicate')) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const counts = options.map((opt) => ({
        option: opt,
        count: voteData.filter((v) => v.position === opt).length,
      }))
      const distribution = counts.map((c) => `${c.count}× ${c.option}`).join(', ')
      return NextResponse.json({ added: voteData.length, distribution })

    } else if (type === 'timeseries') {
      // TIMESERIES: voters submit numeric price predictions
      const voteData = [
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000001', voter_type: 'HUMAN', position: 'NUMERIC', confidence: 0.8, numeric_value: 102500 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000002', voter_type: 'HUMAN', position: 'NUMERIC', confidence: 0.7, numeric_value: 98000 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000003', voter_type: 'HUMAN', position: 'NUMERIC', confidence: 0.9, numeric_value: 110000 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000004', voter_type: 'HUMAN', position: 'NUMERIC', confidence: 0.6, numeric_value: 95000 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000005', voter_type: 'HUMAN', position: 'NUMERIC', confidence: 0.5, numeric_value: 107500 },
      ]
      const { error } = await supabase.from('votes').insert(voteData)
      if (error && !error.message.includes('duplicate')) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      const prices = voteData.map(v => v.numeric_value)
      const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      return NextResponse.json({
        added: voteData.length,
        distribution: `5 numeric predictions · avg $${avg.toLocaleString()}`,
        predictions: prices,
      })

    } else if (type !== 'claim') {
      // BINARY: YES/NO votes
      const voteData = [
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000001', voter_type: 'HUMAN', position: 'YES', confidence: 0.8 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000002', voter_type: 'HUMAN', position: 'YES', confidence: 0.7 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000003', voter_type: 'HUMAN', position: 'YES', confidence: 0.9 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000004', voter_type: 'HUMAN', position: 'NO',  confidence: 0.6 },
        { prediction_id: id, voter_id: '00000000-0000-0000-0000-000000000005', voter_type: 'HUMAN', position: 'NO',  confidence: 0.5 },
      ]
      const { error } = await supabase.from('votes').insert(voteData)
      if (error && !error.message.includes('duplicate')) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ added: voteData.length, distribution: '3 YES, 2 NO → 60% YES' })
    } else {
      const voteData = [
        { claim_id: id, user_id: '00000000-0000-0000-0000-000000000011', vote_value: true,  confidence: 0.85 },
        { claim_id: id, user_id: '00000000-0000-0000-0000-000000000012', vote_value: true,  confidence: 0.75 },
        { claim_id: id, user_id: '00000000-0000-0000-0000-000000000013', vote_value: true,  confidence: 0.90 },
        { claim_id: id, user_id: '00000000-0000-0000-0000-000000000014', vote_value: false, confidence: 0.70 },
      ]
      const { error } = await supabase.from('claim_votes').insert(voteData)
      if (error && !error.message.includes('duplicate')) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ added: voteData.length, distribution: '3 TRUE, 1 FALSE → 75% TRUE' })
    }
  }

  // ── EXECUTE DEBATE ─────────────────────────────────────────────────────────
  if (action === 'execute-debate') {
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Get the prediction/claim data first
    let predData: any = null

    if (type !== 'claim') {
      const { data: pred } = await supabase.from('predictions').select('*').eq('id', id).single()
      if (!pred) return NextResponse.json({ error: 'Prediction not found' }, { status: 404 })
      predData = pred
    }

    // Get eligible agents
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, mode, is_active, debate_enabled, auto_participate')
      .eq('is_active', true)
      .eq('mode', 'MANAGED')
      .limit(4)

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: 'No active MANAGED agents found. Please create agents first.' }, { status: 400 })
    }

    if (type !== 'claim') {
      // Use real startFreeDebate
      const result = await startFreeDebate(id, {
        title: predData.title,
        description: predData.description,
        category: predData.category,
        deadline: predData.deadline,
        predictionType: predData.prediction_type,
        predictionOptions: predData.prediction_options,
      })

      // Check how many args were actually created
      const { data: args } = await supabase
        .from('arguments')
        .select('id, author_name, position, confidence, numeric_value, content')
        .eq('prediction_id', id)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        agentsFound: agents.length,
        result,
        arguments: args ?? [],
      })
    } else {
      // Real claim debate — agents evaluate the claim via LLM
      const { data: claim } = await supabase.from('claims').select('*').eq('id', id).single()
      if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

      const result = await startFreeClaimDebate(id, {
        title: claim.title,
        description: claim.description,
        category: claim.category,
      })

      const { data: args } = await supabase
        .from('claim_arguments')
        .select('id, author_id, author_type, position, confidence, content')
        .eq('claim_id', id)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        agentsFound: agents.length,
        result,
        arguments: args ?? [],
      })
    }
  }

  // ── RESOLVE ────────────────────────────────────────────────────────────────
  if (action === 'resolve') {
    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
    const { resolutionValue } = body

    if (type !== 'claim') {
      // Bypass deadline check — update directly via admin client
      const updateData: any = { resolution_date: new Date().toISOString() }

      if (type === 'timeseries') {
        if (typeof resolutionValue !== 'number') {
          return NextResponse.json({ error: 'TIMESERIES requires a numeric value' }, { status: 400 })
        }
        updateData.numeric_resolution = resolutionValue
      } else if (type === 'multiple-choice') {
        if (typeof resolutionValue !== 'string') {
          return NextResponse.json({ error: 'MULTIPLE_CHOICE requires a string option' }, { status: 400 })
        }
        updateData.resolved_option_id = resolutionValue
      } else {
        // BINARY
        updateData.resolution_value = resolutionValue
      }

      const { data, error } = await supabase
        .from('predictions')
        .update(updateData)
        .eq('id', id)
        .select().single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ resolved: true, factblock: data })
    } else {
      const validVerdicts = ['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING']
      if (!validVerdicts.includes(resolutionValue)) {
        return NextResponse.json({ error: `Invalid verdict: ${resolutionValue}` }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('claims')
        .update({ verdict: resolutionValue, resolved_at: new Date().toISOString() })
        .eq('id', id)
        .select().single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ resolved: true, factblock: data })
    }
  }

  // ── SIMULATE HISTORY ───────────────────────────────────────────────────────
  if (action === 'simulate-history') {
    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
    if (type === 'claim') return NextResponse.json({ error: 'Claim type not supported' }, { status: 400 })

    const DAYS: number = 7

    const { data: pred } = await supabase
      .from('predictions')
      .select('prediction_type, prediction_options')
      .eq('id', id)
      .single()

    if (!pred) return NextResponse.json({ error: 'Prediction not found' }, { status: 404 })

    const { data: rawVotes } = await supabase
      .from('votes')
      .select('position, numeric_value')
      .eq('prediction_id', id)

    if (!rawVotes || rawVotes.length === 0) {
      return NextResponse.json({ error: '투표가 없습니다. 먼저 투표를 추가하세요.' }, { status: 400 })
    }

    const now = new Date()
    const snapshots: any[] = []

    if (pred.prediction_type === 'BINARY') {
      const total = rawVotes.length
      const yesCount = rawVotes.filter((v: any) => v.position === 'YES').length
      const currentYesPct = (yesCount / total) * 100
      // Start near 50/50, drift toward current
      const startYesPct = 50 + (currentYesPct - 50) * 0.1

      for (let i = 0; i < DAYS; i++) {
        const t = DAYS === 1 ? 1 : i / (DAYS - 1)
        const yesPct = startYesPct + (currentYesPct - startYesPct) * t
        const noPct = 100 - yesPct

        const snapTime = new Date(now)
        snapTime.setDate(snapTime.getDate() - (DAYS - 1 - i))
        snapTime.setHours(9, 0, 0, 0)

        snapshots.push({
          prediction_id: id,
          snapshot_time: snapTime.toISOString(),
          snapshot_hour: snapTime.toISOString(),
          yes_percentage: Math.round(yesPct * 10) / 10,
          no_percentage: Math.round(noPct * 10) / 10,
          yes_count: Math.round(yesCount * t) + 1,
          no_count: Math.round((total - yesCount) * t) + 1,
          total_predictions: total,
          ai_agent_count: 0,
          human_count: total,
        })
      }
    } else if (pred.prediction_type === 'MULTIPLE_CHOICE') {
      const options: string[] = pred.prediction_options ?? []
      const total = rawVotes.length

      const currentCounts: Record<string, number> = {}
      options.forEach((opt: string) => { currentCounts[opt] = 0 })
      rawVotes.forEach((v: any) => { if (v.position in currentCounts) currentCounts[v.position]++ })

      const currentPcts: Record<string, number> = {}
      const uniform = 100 / (options.length || 1)
      options.forEach((opt: string) => {
        currentPcts[opt] = ((currentCounts[opt] ?? 0) / total) * 100
      })

      for (let i = 0; i < DAYS; i++) {
        const t = DAYS === 1 ? 1 : i / (DAYS - 1)
        const distribution: Record<string, number> = {}
        let sum = 0
        options.forEach((opt: string) => {
          const raw = uniform + (currentPcts[opt] - uniform) * t
          distribution[opt] = Math.round(raw * 10) / 10
          sum += distribution[opt]
        })
        // Normalize so values sum to 100
        if (sum > 0) {
          options.forEach((opt: string) => {
            distribution[opt] = Math.round((distribution[opt] / sum) * 1000) / 10
          })
        }

        const snapTime = new Date(now)
        snapTime.setDate(snapTime.getDate() - (DAYS - 1 - i))
        snapTime.setHours(9, 0, 0, 0)

        snapshots.push({
          prediction_id: id,
          snapshot_time: snapTime.toISOString(),
          snapshot_hour: snapTime.toISOString(),
          option_distribution: distribution,
          total_predictions: total,
          ai_agent_count: 0,
          human_count: total,
        })
      }
    } else if (pred.prediction_type === 'TIMESERIES' || pred.prediction_type === 'NUMERIC') {
      // Compute avg from numeric votes
      const numericVotes = rawVotes
        .map((v: any) => v.numeric_value)
        .filter((n: any) => n != null)
        .map(Number)

      if (numericVotes.length === 0) {
        return NextResponse.json({ error: 'numeric_value 가 있는 투표가 없습니다.' }, { status: 400 })
      }

      const currentAvg = numericVotes.reduce((a: number, b: number) => a + b, 0) / numericVotes.length
      // Start 10% below current avg, drift toward current
      const startAvg = currentAvg * 0.9

      for (let i = 0; i < DAYS; i++) {
        const t = DAYS === 1 ? 1 : i / (DAYS - 1)
        const avg = startAvg + (currentAvg - startAvg) * t
        const jitter = (Math.random() - 0.5) * currentAvg * 0.04

        const snapTime = new Date(now)
        snapTime.setDate(snapTime.getDate() - (DAYS - 1 - i))
        snapTime.setHours(9, 0, 0, 0)

        snapshots.push({
          prediction_id: id,
          snapshot_time: snapTime.toISOString(),
          snapshot_hour: snapTime.toISOString(),
          avg_prediction: Math.round((avg + jitter) * 100) / 100,
          median_prediction: Math.round((avg + jitter * 0.8) * 100) / 100,
          total_predictions: numericVotes.length,
          ai_agent_count: 0,
          human_count: numericVotes.length,
        })
      }
    } else {
      return NextResponse.json({ error: 'Unsupported prediction type' }, { status: 400 })
    }

    // Clear existing snapshots and insert fresh ones
    await supabase.from('vote_history').delete().eq('prediction_id', id)
    const { data: inserted, error: insertError } = await supabase
      .from('vote_history')
      .insert(snapshots)
      .select('snapshot_time')

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json({
      created: inserted?.length ?? 0,
      message: `${DAYS}일치 히스토리 스냅샷 생성 완료`,
      snapshots: inserted?.map((s: any) => s.snapshot_time) ?? [],
    })
  }

  // ── BACKFILL AGENT VOTES ───────────────────────────────────────────────────
  // One-time: copy AI_AGENT argument positions into the votes table
  if (action === 'backfill-agent-votes') {
    const { data: args, error: argsErr } = await supabase
      .from('arguments')
      .select('prediction_id, author_id, position, confidence, reasoning, created_at')
      .eq('author_type', 'AI_AGENT')
    if (argsErr) return NextResponse.json({ error: argsErr.message }, { status: 500 })

    // Fetch agent names
    const agentIds = [...new Set((args ?? []).map((a: any) => a.author_id))]
    const { data: agentRows } = await supabase
      .from('agents').select('id, name').in('id', agentIds)
    const nameMap: Record<string, string> = {}
    for (const ag of agentRows ?? []) nameMap[ag.id] = ag.name

    // Keep only latest argument per (prediction_id, author_id) pair
    const latestMap: Record<string, any> = {}
    for (const a of args ?? []) {
      const key = `${a.prediction_id}::${a.author_id}`
      if (!latestMap[key] || new Date(a.created_at) > new Date(latestMap[key].created_at)) {
        latestMap[key] = a
      }
    }
    const voteRows = Object.values(latestMap).map((a: any) => ({
      prediction_id: a.prediction_id,
      voter_id: a.author_id,
      voter_type: 'AI_AGENT',
      voter_name: nameMap[a.author_id] || 'AI Agent',
      position: a.position,
      confidence: a.confidence ?? 0.7,
      weight: 1.0,
      reasoning: a.reasoning ?? null,
    }))

    if (voteRows.length === 0) {
      return NextResponse.json({ inserted: 0, message: 'No AI_AGENT arguments to backfill' })
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('votes')
      .upsert(voteRows, { onConflict: 'prediction_id,voter_id,voter_type' })
      .select('id')
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    return NextResponse.json({
      inserted: inserted?.length ?? voteRows.length,
      total: voteRows.length,
      message: `Backfilled ${voteRows.length} agent votes`,
    })
  }

  // ── CLEANUP ────────────────────────────────────────────────────────────────
  if (action === 'cleanup') {
    const { data: preds } = await supabase
      .from('predictions').select('id').like('title', `${TAG}%`)
    const { data: claims } = await supabase
      .from('claims').select('id').like('title', `${TAG}%`)

    for (const pred of preds ?? []) {
      await supabase.from('arguments').delete().eq('prediction_id', pred.id)
      await supabase.from('votes').delete().eq('prediction_id', pred.id)
      await supabase.from('vote_history').delete().eq('prediction_id', pred.id)
      await supabase.from('debate_rounds').delete().eq('prediction_id', pred.id)
      await supabase.from('predictions').delete().eq('id', pred.id)
    }
    for (const claim of claims ?? []) {
      await supabase.from('claim_arguments').delete().eq('claim_id', claim.id)
      await supabase.from('claim_votes').delete().eq('claim_id', claim.id)
      await supabase.from('claims').delete().eq('id', claim.id)
    }

    return NextResponse.json({
      deleted: { predictions: preds?.length ?? 0, claims: claims?.length ?? 0 },
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

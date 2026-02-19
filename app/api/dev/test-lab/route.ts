import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { startFreeDebate } from '@/lib/agents/simple-debate'

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
      supabase.from('votes').select('id, position, voter_type').eq('prediction_id', id),
      supabase.from('vote_history').select('snapshot_time, avg_prediction, yes_percentage').eq('prediction_id', id).order('snapshot_time', { ascending: false }).limit(5),
    ])

    const yesVotes = votes?.filter(v => v.position === 'YES').length ?? 0
    const totalVotes = votes?.length ?? 0
    const consensus = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : null

    return NextResponse.json({
      factblock: pred,
      stats: {
        argumentCount: args?.length ?? 0,
        voteCount: totalVotes,
        consensus,
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
          options: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Microsoft AI'],
        })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      startFreeDebate(data.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        deadline: data.deadline,
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

      return NextResponse.json({ id: data.id, factblock: data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  // ── ADD VOTES ──────────────────────────────────────────────────────────────
  if (action === 'add-votes') {
    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })

    if (type !== 'claim') {
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
      // Claim debate — find a real user for FK
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1 })
      const userId = users?.[0]?.id
      if (!userId) return NextResponse.json({ error: 'No users found' }, { status: 400 })

      // Insert claim arguments for each eligible agent
      const argInserts = agents.slice(0, 3).map((agent, i) => ({
        claim_id: id,
        author_id: userId,
        position: i % 2 === 0 ? 'TRUE' : 'FALSE',
        content: i % 2 === 0
          ? `Evidence strongly supports this claim. Multiple independent sources have documented this event, and cross-referenced reporting confirms the factual accuracy of the statement in question. [Agent: ${agent.name}]`
          : `Contrary evidence challenges this claim. Critical examination of source materials reveals discrepancies that call into question the accuracy of this statement as presented. [Agent: ${agent.name}]`,
        confidence: 0.65 + Math.random() * 0.25,
      }))

      const { data: inserted, error } = await supabase
        .from('claim_arguments')
        .insert(argInserts)
        .select()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({
        agentsFound: agents.length,
        arguments: inserted ?? [],
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
      } else {
        // BINARY or MULTIPLE_CHOICE
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
      const validVerdicts = ['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIABLE']
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

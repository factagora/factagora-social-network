import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '../lib/supabase/client'

async function viewDebateResults() {
  const supabase = createClient()

  console.log('\n' + '='.repeat(80))
  console.log('🎭 DEBATE RESULTS - Agent Discussion & ReAct Cycles')
  console.log('='.repeat(80) + '\n')

  // Get all predictions
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: true })

  if (!predictions || predictions.length === 0) {
    console.log('❌ No predictions found')
    return
  }

  for (const prediction of predictions) {
    console.log('\n' + '─'.repeat(80))
    console.log(`📊 PREDICTION: ${prediction.title}`)
    console.log('─'.repeat(80))
    console.log(`Description: ${prediction.description}`)
    console.log(`Category: ${prediction.category}`)
    console.log(`Deadline: ${prediction.deadline}`)
    console.log()

    // Get debate rounds
    const { data: rounds } = await supabase
      .from('debate_rounds')
      .select('*')
      .eq('prediction_id', prediction.id)
      .order('round_number', { ascending: true })

    if (!rounds || rounds.length === 0) {
      console.log('  ℹ️  No debate rounds yet\n')
      continue
    }

    for (const round of rounds) {
      console.log(`\n🔄 ROUND ${round.round_number}`)
      console.log(`   Consensus: ${(round.consensus_score * 100).toFixed(1)}%`)
      console.log(`   Avg Confidence: ${(round.avg_confidence * 100).toFixed(1)}%`)
      console.log(`   Position Distribution: YES=${round.position_distribution.yes} NO=${round.position_distribution.no} NEUTRAL=${round.position_distribution.neutral}`)
      if (round.is_final) {
        console.log(`   🏁 Final Round - Reason: ${round.termination_reason}`)
      }
      console.log()

      // Get argumentsList for this round
      const { data: argumentsList } = await supabase
        .from('argumentsList')
        .select('*')
        .eq('prediction_id', prediction.id)
        .eq('round_number', round.round_number)
        .order('created_at', { ascending: true })

      if (!argumentsList || argumentsList.length === 0) {
        console.log('  ℹ️  No argumentsList in this round\n')
        continue
      }

      for (const arg of argumentsList) {
        console.log(`\n  🤖 ${arg.author_name} (${arg.author_type})`)
        console.log(`  ├─ Position: ${arg.position}`)
        console.log(`  ├─ Confidence: ${(arg.confidence * 100).toFixed(0)}%`)
        console.log(`  ├─ Content: ${arg.content.substring(0, 200)}${arg.content.length > 200 ? '...' : ''}`)

        if (arg.reasoning) {
          console.log(`  ├─ Reasoning: ${arg.reasoning.substring(0, 150)}${arg.reasoning.length > 150 ? '...' : ''}`)
        }

        // Get ReAct cycle for this argument
        const { data: reactCycles } = await supabase
          .from('agent_react_cycles')
          .select('*')
          .eq('argument_id', arg.id)

        if (reactCycles && reactCycles.length > 0) {
          const cycle = reactCycles[0]
          console.log(`  │`)
          console.log(`  ├─ 🧠 ReAct Cycle Details:`)
          console.log(`  │  ├─ Initial Reasoning: ${cycle.initial_reasoning.substring(0, 150)}...`)
          console.log(`  │  ├─ Hypothesis: ${cycle.hypothesis.substring(0, 100)}...`)
          console.log(`  │  ├─ Actions Taken: ${cycle.actions.length} actions`)

          if (cycle.actions.length > 0) {
            console.log(`  │  │  └─ Sample: ${cycle.actions[0].type} - ${cycle.actions[0].query?.substring(0, 60)}...`)
          }

          console.log(`  │  ├─ Evidence Gathered: ${cycle.evidence_gathered.length} items`)
          if (cycle.evidence_gathered.length > 0) {
            console.log(`  │  │  └─ Sample: ${cycle.evidence_gathered[0].source?.substring(0, 80)}...`)
          }

          console.log(`  │  ├─ Observations: ${cycle.observations.length} observations`)
          if (cycle.observations.length > 0) {
            console.log(`  │  │  └─ Sample: ${cycle.observations[0].observation?.substring(0, 80)}...`)
          }

          console.log(`  │  ├─ Synthesis: ${cycle.synthesis_reasoning.substring(0, 150)}...`)
          console.log(`  │  └─ Execution Time: ${cycle.execution_time_ms}ms`)
        }

        console.log(`  └─`)
      }
    }

    console.log('\n' + '─'.repeat(80) + '\n')
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Debate Results Display Complete')
  console.log('='.repeat(80) + '\n')
}

viewDebateResults().catch(console.error)

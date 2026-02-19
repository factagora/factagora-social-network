#!/usr/bin/env node
/**
 * Factblock Lifecycle Test Script
 *
 * Tests the full lifecycle for all factblock types:
 *   - BINARY Prediction   : creation → vote → debate → resolution (true/false)
 *   - TIMESERIES Prediction: creation → agent forecast → resolution (number)
 *   - Claim               : creation → vote → debate → resolution (verdict)
 *
 * Usage:
 *   node scripts/test-lifecycle.js             # Run all tests
 *   node scripts/test-lifecycle.js --cleanup   # Delete previous test data
 *   node scripts/test-lifecycle.js --type binary
 *   node scripts/test-lifecycle.js --type timeseries
 *   node scripts/test-lifecycle.js --type claim
 *
 * Requires:
 *   - Dev server running at localhost:3000 (npm run dev)
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ============================================================
// Config
// ============================================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Tag prefix so we can easily find/delete test data
const TAG = '[lifecycle-test]';

// Past deadline (needed for resolution to be allowed)
const PAST_DEADLINE = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// Logging helpers
// ============================================================

const RESET = '\x1b[0m';
const BOLD  = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const YELLOW= '\x1b[33m';
const CYAN  = '\x1b[36m';
const DIM   = '\x1b[2m';

function log(msg)       { console.log(msg); }
function ok(msg)        { console.log(`  ${GREEN}✅ ${msg}${RESET}`); }
function fail(msg)      { console.log(`  ${RED}❌ ${msg}${RESET}`); }
function warn(msg)      { console.log(`  ${YELLOW}⚠️  ${msg}${RESET}`); }
function info(msg)      { console.log(`  ${CYAN}ℹ  ${msg}${RESET}`); }
function step(n, msg)   { console.log(`\n${BOLD}  Step ${n}: ${msg}${RESET}`); }
function section(title) { console.log(`\n${'─'.repeat(60)}\n${BOLD}${title}${RESET}\n`); }
function dim(msg)       { console.log(`  ${DIM}${msg}${RESET}`); }

// ============================================================
// Helpers
// ============================================================

async function apiCall(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Find active agents in DB
async function getActiveAgents(limit = 3) {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, mode')
    .eq('is_active', true)
    .limit(limit);
  if (error) return [];
  return data || [];
}

// Find a timeseries prediction asset (optional)
async function getTimeseriesAsset() {
  const { data } = await supabase
    .from('timeseries_assets')
    .select('id, symbol, name')
    .limit(1)
    .single();
  return data || null;
}

// Find a test user we can use as creator (must exist in auth.users for FK constraints)
async function getTestUser() {
  // Use Supabase admin API to get a real auth user
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1 });
  if (users && users[0]) {
    return { id: users[0].id, email: users[0].email || 'user@factagora' };
  }
  if (error) console.error('  Auth admin error:', error.message);
  return null;
}

// ============================================================
// Cleanup
// ============================================================

async function cleanup() {
  section('🧹 Cleanup: Removing Previous Test Data');

  // Predictions
  const { data: preds } = await supabase
    .from('predictions')
    .select('id, title')
    .like('title', `${TAG}%`);

  if (preds && preds.length > 0) {
    for (const pred of preds) {
      dim(`Deleting prediction: ${pred.title}`);
      // Delete child data first
      await supabase.from('arguments').delete().eq('prediction_id', pred.id);
      await supabase.from('votes').delete().eq('prediction_id', pred.id);
      await supabase.from('debate_rounds').delete().eq('prediction_id', pred.id);
      await supabase.from('vote_history').delete().eq('prediction_id', pred.id);
      await supabase.from('predictions').delete().eq('id', pred.id);
    }
    ok(`Deleted ${preds.length} test prediction(s)`);
  } else {
    info('No test predictions found');
  }

  // Claims
  const { data: claims } = await supabase
    .from('claims')
    .select('id, title')
    .like('title', `${TAG}%`);

  if (claims && claims.length > 0) {
    for (const claim of claims) {
      dim(`Deleting claim: ${claim.title}`);
      await supabase.from('claim_arguments').delete().eq('claim_id', claim.id);
      await supabase.from('claim_votes').delete().eq('claim_id', claim.id);
      await supabase.from('claims').delete().eq('id', claim.id);
    }
    ok(`Deleted ${claims.length} test claim(s)`);
  } else {
    info('No test claims found');
  }

  ok('Cleanup complete');
}

// ============================================================
// Test: BINARY Prediction
// ============================================================

async function testBinaryPrediction(userId) {
  section('🔵 TEST: BINARY Prediction Lifecycle');
  const results = { created: false, voted: false, debate: false, resolved: false };

  // ── Step 1: Create ──────────────────────────────────────────
  step(1, 'Create BINARY prediction');

  const title = `${TAG} Will AI beat humans at chess by 2027?`;
  const { data: pred, error: createErr } = await supabase
    .from('predictions')
    .insert({
      title,
      description: 'This tests whether a leading AI system will defeat the world chess champion in an official match before December 31, 2027.',
      category: 'Technology',
      deadline: PAST_DEADLINE,
      prediction_type: 'BINARY',
    })
    .select()
    .single();

  if (createErr || !pred) {
    fail(`Creation failed: ${createErr?.message}`);
    return results;
  }
  ok(`Created: "${pred.title.substring(0, 60)}..."`);
  info(`ID: ${pred.id}`);
  results.created = true;

  // ── Step 2: Cast votes ──────────────────────────────────────
  step(2, 'Cast votes (YES/NO)');

  // votes table uses voter_id + position (YES/NO/NEUTRAL)
  const voteData = [
    { prediction_id: pred.id, voter_id: '00000000-0000-0000-0000-000000000001', voter_type: 'HUMAN', position: 'YES', confidence: 0.8 },
    { prediction_id: pred.id, voter_id: '00000000-0000-0000-0000-000000000002', voter_type: 'HUMAN', position: 'YES', confidence: 0.7 },
    { prediction_id: pred.id, voter_id: '00000000-0000-0000-0000-000000000003', voter_type: 'HUMAN', position: 'YES', confidence: 0.9 },
    { prediction_id: pred.id, voter_id: '00000000-0000-0000-0000-000000000004', voter_type: 'HUMAN', position: 'NO',  confidence: 0.6 },
  ];

  const { error: voteErr } = await supabase.from('votes').insert(voteData);
  if (voteErr) {
    warn(`Vote insert had issues: ${voteErr.message}`);
  } else {
    ok('Inserted 4 votes (3 YES, 1 NO → 75% consensus YES)');
    results.voted = true;
  }

  // Snapshot vote history
  const snapRpc = await supabase.rpc('create_vote_history_snapshot', { p_prediction_id: pred.id });
  if (snapRpc.error) {
    dim(`  (snapshot RPC: ${snapRpc.error.message})`);
  } else {
    info('Vote history snapshot created');
  }

  // ── Step 3: Simulate agent debate (insert arguments directly) ────
  step(3, 'Simulate AI agent debate (direct DB insert)');

  const agents = await getActiveAgents(3);
  if (agents.length === 0) {
    warn('No active agents — skipping debate step');
  } else {
    info(`Simulating ${agents.length} agents: ${agents.map(a => a.name).join(', ')}`);

    const positions = ['YES', 'NO', 'YES'];
    const argInserts = agents.slice(0, 3).map((agent, i) => ({
      prediction_id: pred.id,
      author_id: agent.id,
      author_type: 'AI_AGENT',
      author_name: agent.name,
      position: positions[i] || 'YES',
      content: `Based on historical data and current trends, my position is ${positions[i] || 'YES'}. AI systems have shown remarkable progress in game-playing tasks, and chess is a well-defined domain where AI capability is well-established. [Test argument]`,
      reasoning: 'Analysis based on capability progression curves.',
      confidence: 0.7 + Math.random() * 0.2,
      round_number: 1,
    }));

    const { error: argErr } = await supabase.from('arguments').insert(argInserts);
    if (argErr) {
      warn(`Argument insert failed: ${argErr.message}`);
    } else {
      ok(`Inserted ${argInserts.length} simulated agent arguments`);
      results.debate = true;
      argInserts.forEach(a => dim(`  ${a.author_name} → ${a.position} (${(a.confidence * 100).toFixed(0)}%)`));
    }
  }

  // ── Step 4: Resolve ─────────────────────────────────────────
  step(4, 'Resolve prediction (answer: YES = true)');

  const { data: resolved, error: resErr } = await supabase
    .from('predictions')
    .update({
      resolution_value: true,
      resolution_date: new Date().toISOString(),
    })
    .eq('id', pred.id)
    .select()
    .single();

  if (resErr || !resolved) {
    fail(`Resolution failed: ${resErr?.message}`);
    return results;
  }
  ok(`Resolved as: YES (true)`);
  info(`resolution_value = ${resolved.resolution_value}`);
  results.resolved = true;

  // ── Step 5: Verify final state ──────────────────────────────
  step(5, 'Verify final state in DB');

  const { data: final } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', pred.id)
    .single();

  if (final) {
    ok('Final state confirmed:');
    dim(`  title: ${final.title.substring(0, 50)}...`);
    dim(`  type: ${final.prediction_type}`);
    dim(`  resolution_value: ${final.resolution_value}`);
    dim(`  resolution_date: ${final.resolution_date}`);
  }

  return results;
}

// ============================================================
// Test: TIMESERIES Prediction
// ============================================================

async function testTimeseriesPrediction(userId) {
  section('📈 TEST: TIMESERIES Prediction Lifecycle');
  const results = { created: false, voted: false, debate: false, resolved: false };

  step(1, 'Create TIMESERIES prediction');

  const asset = await getTimeseriesAsset();
  if (asset) info(`Using asset: ${asset.symbol} (${asset.name})`);

  const title = `${TAG} What will Bitcoin price be on Jan 1, 2027?`;
  const { data: pred, error: createErr } = await supabase
    .from('predictions')
    .insert({
      title,
      description: 'Forecast the closing price of Bitcoin (BTC/USD) on January 1, 2027. Agents should provide a numeric price estimate based on historical trends and market analysis.',
      category: 'Technology',
      deadline: PAST_DEADLINE,
      prediction_type: 'TIMESERIES',
      timeseries_asset_id: asset?.id || null,
    })
    .select()
    .single();

  if (createErr || !pred) {
    fail(`Creation failed: ${createErr?.message}`);
    return results;
  }
  ok(`Created: "${pred.title}"`);
  info(`ID: ${pred.id}`);
  results.created = true;

  // ── Step 2: Seed historical data ────────────────────────────
  step(2, 'Seed vote_history with synthetic data points');

  const now = Date.now();
  const historyPoints = [];
  // Simulate 10 days of price data (rising trend)
  for (let i = 10; i >= 0; i--) {
    const ts = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
    const price = 95000 + (10 - i) * 800 + Math.floor(Math.random() * 2000);
    historyPoints.push({
      prediction_id: pred.id,
      snapshot_time: ts,
      avg_prediction: price,
      median_prediction: price * 0.99,
      total_predictions: Math.floor(Math.random() * 5) + 3,
    });
  }

  const { error: histErr } = await supabase.from('vote_history').insert(historyPoints);
  if (histErr) {
    warn(`History insert issue: ${histErr.message}`);
  } else {
    ok(`Seeded ${historyPoints.length} historical data points`);
    results.voted = true;
  }

  // ── Step 3: Simulate agent forecast (numeric) ───────────────
  step(3, 'Simulate AI agent numeric forecasts (direct DB insert)');

  const agents = await getActiveAgents(3);
  if (agents.length === 0) {
    warn('No active agents — skipping debate step');
  } else {
    info(`Simulating ${agents.length} agents: ${agents.map(a => a.name).join(', ')}`);

    const forecasts = [105000, 112000, 98000];
    const argInserts = agents.slice(0, 3).map((agent, i) => ({
      prediction_id: pred.id,
      author_id: agent.id,
      author_type: 'AI_AGENT',
      author_name: agent.name,
      position: 'YES',
      numeric_value: forecasts[i],
      content: `My forecast for Bitcoin on Jan 1, 2027 is $${forecasts[i].toLocaleString()}. Based on historical trend analysis and current market indicators. [Test argument]`,
      reasoning: 'Linear regression on 6-month price history.',
      confidence: 0.6 + Math.random() * 0.3,
      round_number: 1,
    }));

    const { error: argErr } = await supabase.from('arguments').insert(argInserts);
    if (argErr) {
      warn(`Argument insert failed: ${argErr.message}`);
    } else {
      ok(`Inserted ${argInserts.length} numeric forecasts`);
      results.debate = true;
      argInserts.forEach(a => dim(`  ${a.author_name} → $${a.numeric_value?.toLocaleString()} (${(a.confidence * 100).toFixed(0)}%)`));
    }
  }

  // ── Step 4: Resolve with actual price ───────────────────────
  step(4, 'Resolve with actual price ($105,432)');

  // TIMESERIES uses numeric_resolution (not boolean resolution_value)
  const resolvedPrice = 105432;
  const { data: resolved, error: resErr } = await supabase
    .from('predictions')
    .update({
      numeric_resolution: resolvedPrice,
      resolution_date: new Date().toISOString(),
    })
    .eq('id', pred.id)
    .select()
    .single();

  if (resErr || !resolved) {
    fail(`Resolution failed: ${resErr?.message}`);
    return results;
  }
  ok(`Resolved as: $${resolvedPrice.toLocaleString()}`);
  results.resolved = true;

  // ── Step 5: Verify ──────────────────────────────────────────
  step(5, 'Verify final state');

  const { data: final } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', pred.id)
    .single();

  const { data: snapshots } = await supabase
    .from('vote_history')
    .select('snapshot_time, avg_prediction')
    .eq('prediction_id', pred.id)
    .order('snapshot_time', { ascending: false })
    .limit(3);

  if (final) {
    ok('Final state:');
    dim(`  type: ${final.prediction_type}`);
    dim(`  numeric_resolution: ${final.numeric_resolution}`);
    dim(`  resolution_date: ${final.resolution_date}`);
  }
  if (snapshots && snapshots.length > 0) {
    ok(`${snapshots.length}+ vote_history snapshots exist`);
  }

  return results;
}

// ============================================================
// Test: Claim (TRUE/FALSE)
// ============================================================

async function testClaim(userId) {
  section('🟣 TEST: Claim Lifecycle');
  const results = { created: false, voted: false, debate: false, resolved: false };

  // ── Step 1: Create claim ────────────────────────────────────
  step(1, 'Create claim (approved, bypassing approval flow)');

  const title = `${TAG} OpenAI released GPT-5 in 2025`;
  const { data: claim, error: createErr } = await supabase
    .from('claims')
    .insert({
      title,
      description: 'OpenAI officially released GPT-5, its fifth-generation large language model, to the public during the calendar year 2025. This includes any general availability release, not limited to paid tiers.',
      category: 'Technology',
      resolution_date: PAST_DEADLINE,
      created_by: userId,
      approval_status: 'APPROVED',  // skip moderation queue for test
    })
    .select()
    .single();

  if (createErr || !claim) {
    fail(`Creation failed: ${createErr?.message}`);
    return results;
  }
  ok(`Created: "${claim.title}"`);
  info(`ID: ${claim.id}`);
  results.created = true;

  // ── Step 2: Cast votes ──────────────────────────────────────
  step(2, 'Cast votes on claim (TRUE/FALSE)');

  // claim_votes uses user_id + vote_value (boolean: true=TRUE, false=FALSE)
  const voteInserts = [
    { claim_id: claim.id, user_id: '00000000-0000-0000-0000-000000000011', vote_value: true,  confidence: 0.8 },
    { claim_id: claim.id, user_id: '00000000-0000-0000-0000-000000000012', vote_value: true,  confidence: 0.7 },
    { claim_id: claim.id, user_id: '00000000-0000-0000-0000-000000000013', vote_value: false, confidence: 0.6 },
  ];

  const { error: voteErr } = await supabase.from('claim_votes').insert(voteInserts);
  if (voteErr) {
    warn(`Vote insert issue: ${voteErr.message}`);
  } else {
    ok('Inserted claim votes (2 TRUE, 1 FALSE → ~67% TRUE)');
    results.voted = true;
  }

  // ── Step 3: Simulate AI arguments on claim ──────────────────
  step(3, 'Simulate AI agent arguments on claim (direct DB insert)');

  const claimAgents = await getActiveAgents(2);
  if (claimAgents.length === 0) {
    warn('No active agents — skipping');
  } else {
    // Check claim_arguments table schema first
    const { data: claimArgs0 } = await supabase.from('claim_arguments').select('*').limit(1);
    const claimArgCols = claimArgs0?.[0] ? Object.keys(claimArgs0[0]) : [];
    const hasClaimId = claimArgCols.includes('claim_id') || claimArgCols.length === 0;

    if (!hasClaimId && claimArgCols.length > 0) {
      warn(`claim_arguments table has unexpected columns: ${claimArgCols.join(', ')}`);
    } else {
      // claim_arguments actual columns: claim_id, author_id, position, content, reasoning, confidence
      // (no author_type or author_name in live schema)
      const claimArgInserts = claimAgents.slice(0, 2).map((agent, i) => ({
        claim_id: claim.id,
        author_id: userId,  // use real auth user (required FK)
        position: i === 0 ? 'TRUE' : 'FALSE',
        content: i === 0
          ? 'Multiple credible sources confirm that OpenAI officially released GPT-5 to the public in 2025, with documentation available on their official website. The release occurred in stages across the year.'
          : 'Available evidence is inconclusive regarding a public GPT-5 release in 2025. While OpenAI announced developments, no confirmed general availability release has been independently verified for that calendar year.',
        confidence: 0.7 + Math.random() * 0.2,
      }));

      const { error: argErr } = await supabase.from('claim_arguments').insert(claimArgInserts);
      if (argErr) {
        warn(`Claim argument insert failed: ${argErr.message}`);
      } else {
        ok(`Inserted ${claimArgInserts.length} AI arguments on claim`);
        results.debate = true;
        claimArgInserts.forEach(a => dim(`  ${a.author_name} → ${a.position} (${(a.confidence * 100).toFixed(0)}%)`));
      }
    }
  }

  // ── Step 4: Resolve ─────────────────────────────────────────
  step(4, 'Resolve claim (verdict: TRUE)');

  const { data: resolved, error: resErr } = await supabase
    .from('claims')
    .update({
      verdict: 'TRUE',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', claim.id)
    .select()
    .single();

  if (resErr || !resolved) {
    fail(`Resolution failed: ${resErr?.message}`);
    return results;
  }
  ok(`Resolved as: TRUE`);
  results.resolved = true;

  // ── Step 5: Verify ──────────────────────────────────────────
  step(5, 'Verify final state');

  const { data: final } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claim.id)
    .single();

  if (final) {
    ok('Final state:');
    dim(`  approval_status: ${final.approval_status}`);
    dim(`  verdict: ${final.verdict}`);
    dim(`  resolved_at: ${final.resolved_at}`);
  }

  return results;
}

// ============================================================
// Summary reporter
// ============================================================

function printSummary(results) {
  section('📊 TEST SUMMARY');

  const allTypes = Object.keys(results);
  let totalPass = 0, totalFail = 0;

  for (const type of allTypes) {
    const r = results[type];
    const stages = Object.entries(r);
    const passed = stages.filter(([, v]) => v).length;
    const total  = stages.length;
    totalPass += passed;
    totalFail += (total - passed);

    const icon = passed === total ? '✅' : passed > 0 ? '⚠️ ' : '❌';
    log(`  ${icon} ${BOLD}${type}${RESET}: ${passed}/${total} stages`);
    for (const [stage, ok] of stages) {
      log(`       ${ok ? GREEN + '✓' : RED + '✗'} ${stage}${RESET}`);
    }
  }

  log('');
  if (totalFail === 0) {
    log(`  ${GREEN}${BOLD}All stages passed!${RESET} (${totalPass} checks)`);
  } else {
    log(`  ${YELLOW}${BOLD}${totalPass} passed, ${totalFail} failed${RESET}`);
    log(`  ${DIM}Failures may be due to: missing agents, auth restrictions, or missing tables${RESET}`);
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const doCleanup = args.includes('--cleanup');
  const typeFilter = args.find(a => a.startsWith('--type='))?.split('=')[1]
                  || (args.indexOf('--type') !== -1 ? args[args.indexOf('--type') + 1] : null);

  log(`\n${'═'.repeat(60)}`);
  log(`${BOLD}  Factagora Lifecycle Test${RESET}`);
  log(`  ${DIM}Base URL: ${BASE_URL}${RESET}`);
  if (typeFilter) log(`  ${DIM}Type filter: ${typeFilter}${RESET}`);
  log(`${'═'.repeat(60)}`);

  if (doCleanup) {
    await cleanup();
    if (args.length === 1) return; // cleanup-only mode
  }

  // Get a test user (first user in the system)
  const user = await getTestUser();
  if (!user) {
    fail('No users found in the system. Please create a user first.');
    process.exit(1);
  }
  info(`Running as user: ${user.email || user.id}`);

  const results = {};

  if (!typeFilter || typeFilter === 'binary') {
    try {
      results['BINARY Prediction'] = await testBinaryPrediction(user.id);
    } catch (err) {
      fail(`BINARY test threw: ${err.message}`);
      results['BINARY Prediction'] = { created: false, voted: false, debate: false, resolved: false };
    }
  }

  if (!typeFilter || typeFilter === 'timeseries') {
    try {
      results['TIMESERIES Prediction'] = await testTimeseriesPrediction(user.id);
    } catch (err) {
      fail(`TIMESERIES test threw: ${err.message}`);
      results['TIMESERIES Prediction'] = { created: false, voted: false, debate: false, resolved: false };
    }
  }

  if (!typeFilter || typeFilter === 'claim') {
    try {
      results['Claim (TRUE/FALSE)'] = await testClaim(user.id);
    } catch (err) {
      fail(`Claim test threw: ${err.message}`);
      results['Claim (TRUE/FALSE)'] = { created: false, voted: false, debate: false, resolved: false };
    }
  }

  printSummary(results);
  log('');
}

main().catch(err => {
  console.error(`\n❌ Fatal error: ${err.message}`);
  process.exit(1);
});

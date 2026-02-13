# Test Scripts for Round Orchestrator

## Prerequisites

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Apply database migration**

   Go to Supabase Dashboard → SQL Editor → New Query

   Run the migration file:
   - `supabase/migrations/20260210_multi_agent_system.sql`

3. **Set API key**
   ```bash
   export ANTHROPIC_API_KEY=your_key_here
   ```

   Or add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

4. **Create sample data**

   Go to Supabase Dashboard → SQL Editor → New Query

   Run:
   - `scripts/create-sample-data.sql`

   This creates:
   - 3 sample agents (Skeptic, Optimist, Data Analyst)
   - 2 sample predictions (AGI 2026, Tesla Q4 Revenue)

## Running Tests

### Option 1: Test both predictions automatically

```bash
npx tsx scripts/test-both-predictions.ts
```

This will:
1. Test AGI prediction (future event)
2. Test Tesla revenue claim (fact check)
3. Show detailed results for each
4. Save all data to database

**Expected output:**
```
🚀 Starting Round Orchestrator Tests
================================================================================

✅ Environment check passed
   API Key: sk-ant-a...

================================================================================
🎯 Testing: AGI by 2026 (Future Prediction)
================================================================================

📋 Prediction ID: 00000000-0000-0000-0000-000000000001
▶️  Executing Round 1...

📊 Results:
────────────────────────────────────────────────────────────
⏱️  Total Duration: 8.2s
🤖 Agents: 3/3 succeeded

📈 Position Distribution:
   YES: 1
   NO: 2
   NEUTRAL: 0

💯 Average Confidence: 83.3%
🎯 Consensus Score: 66.7%

🏁 Should Terminate: ❌ NO

🤖 Individual Agent Results:

1. ✅ Skeptic Bot
   Position: NO
   Confidence: 85%
   Execution Time: 2341ms
   Evidence Items: 3
   Actions Taken: 3
   Observations: 4
   Sample Evidence: "Historical AGI prediction accuracy: 5%"
   Initial Thought: "AGI has been predicted for decades but never materialized. Hardware constraints..."

2. ✅ Optimist Bot
   Position: YES
   Confidence: 90%
   ...
```

### Option 2: Test single prediction

```bash
# Test AGI prediction
npx tsx lib/agents/test-orchestrator.ts 00000000-0000-0000-0000-000000000001

# Test Tesla claim
npx tsx lib/agents/test-orchestrator.ts 00000000-0000-0000-0000-000000000002
```

### Option 3: Via API

```bash
# Start dev server
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/predictions/00000000-0000-0000-0000-000000000001/execute-round \
  -H "Content-Type: application/json" \
  -d '{"roundNumber": 1}'
```

## Verifying Results

### Check Database

Go to Supabase Dashboard → Table Editor

1. **arguments** table
   - Should have 3 new rows (one per agent)
   - Check `position`, `confidence`, `evidence`

2. **agent_react_cycles** table
   - Should have 3 new rows
   - Check `initial_reasoning`, `actions`, `observations`, `synthesis_reasoning`

3. **debate_rounds** table
   - Should have 1 new row
   - Check `consensus_score`, `position_distribution`, `is_final`

### Check UI

```bash
npm run dev
```

Navigate to:
- http://localhost:3000/predictions
- Click on a prediction
- Should see the arguments from agents

## Sample Data Details

### Agents (3 total)

1. **Skeptic Bot**
   - Personality: SKEPTIC
   - Temperature: 0.2 (conservative)
   - Tendency: Questions assumptions, demands evidence

2. **Optimist Bot**
   - Personality: OPTIMIST
   - Temperature: 0.7 (creative)
   - Tendency: Sees potential, emphasizes positive trends

3. **Data Analyst Bot**
   - Personality: DATA_ANALYST
   - Temperature: 0.3 (analytical)
   - Tendency: Focuses on quantitative data and statistics

### Predictions (2 total)

1. **AGI by 2026** (ID: `00000000-0000-0000-0000-000000000001`)
   - Type: Future prediction
   - Category: tech
   - Deadline: 2026-12-31
   - Tests: Can agents reason about future possibilities?

2. **Tesla Q4 Revenue** (ID: `00000000-0000-0000-0000-000000000002`)
   - Type: Fact verification
   - Category: economics
   - Deadline: 2026-03-31
   - Tests: Can agents verify historical claims?

## Troubleshooting

### Error: "No active agents found"

Make sure you ran `scripts/create-sample-data.sql` in Supabase.

Check agents:
```sql
SELECT * FROM agents WHERE is_active = true;
```

### Error: "Prediction not found"

Make sure the sample predictions exist:
```sql
SELECT id, title FROM predictions WHERE id LIKE '00000000%';
```

### Error: "ANTHROPIC_API_KEY not set"

```bash
export ANTHROPIC_API_KEY=your_key_here
```

### Error: Database connection issues

Make sure `.env.local` has correct Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Expected Behavior

### Round 1 Results

For **AGI prediction**, typical results:
- Skeptic: NO (80-90% confidence)
  - "Historical failure rate, hardware constraints, unsolved alignment"
- Optimist: YES (85-95% confidence)
  - "Exponential progress, recent breakthroughs, investment surge"
- Data Analyst: NO or NEUTRAL (70-80% confidence)
  - "Base rate suggests <5% probability, insufficient data"

Result: **No consensus** (66.7%), continues to Round 2

For **Tesla revenue claim**, typical results:
- Skeptic: NEUTRAL (60-70% confidence)
  - "Need to verify official SEC filing, preliminary reports unreliable"
- Optimist: YES (80-90% confidence)
  - "Multiple credible sources confirm, aligns with Q3 trends"
- Data Analyst: YES or NEUTRAL (75-85% confidence)
  - "Awaiting official 10-K filing for final verification"

Result: **Possible consensus** or continues based on distribution

## Next Steps

After successful tests:

1. ✅ Add "Start Debate" button to prediction detail page
2. ✅ Display debate rounds in UI
3. ✅ Show ReAct cycles for each agent
4. ✅ Implement Round 2+ with agent replies
5. ✅ Add real-time updates (polling or webhooks)

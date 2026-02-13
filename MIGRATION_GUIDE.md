# Migration & Testing Guide

## 🚀 Quick Start

### Step 1: Check Current Status
```bash
node check-all-migrations.mjs
```

### Step 2: Apply Migrations

#### 2.1 Open Supabase SQL Editor
🔗 **https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql**

#### 2.2 Apply P2: Evidence Credibility System
1. Click "+ New query"
2. Open file: `supabase/migrations/20260213_evidence_credibility_system.sql`
3. Copy entire content and paste into SQL editor
4. Click "Run"
5. Verify success: "Success. No rows returned"

#### 2.3 Apply P4: Agent Participation System
1. Click "+ New query" again
2. Open file: `supabase/migrations/20260213_agent_participation_system.sql`
3. Copy entire content and paste into SQL editor
4. Click "Run"
5. Verify success: "Success. No rows returned"

### Step 3: Verify Migrations
```bash
node check-all-migrations.mjs
```

Expected output:
```
✅ P1: Verdict System
✅ P2: Evidence Credibility System
✅ P4: Agent Participation System

🎉 All migrations applied successfully!
```

### Step 4: Test System
```bash
node test-mvp-system.mjs
```

## 📊 What Gets Created

### P2: Evidence Credibility System
- **source_reputation** table with 17 pre-seeded sources
- **fact_checker_reputation** table
- **claim_consensus** table
- **google_factcheck_cache** table
- Enhanced **claim_evidence** table with credibility fields
- Database functions for credibility calculation

### P4: Agent Participation System
- **agent_predictions** table
- **agent_claim_participation** table
- **agent_performance** table
- **agent_execution_queue** table
- Enhanced **agents** table with auto-participate settings
- Database functions for Brier score and performance tracking

## 🧪 API Testing

### Test Agent Prediction Submission
```bash
curl -X POST http://localhost:3000/api/predictions/[prediction-id]/agents/participate \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "your-agent-id",
    "probability": 0.75,
    "reasoning": "Based on analysis...",
    "confidenceLevel": "HIGH"
  }'
```

### Test Evidence Submission
```bash
curl -X POST http://localhost:3000/api/claims/[claim-id]/agents/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "your-agent-id",
    "content": "Evidence text...",
    "sourceUrl": "https://example.com/source",
    "supportsClai": true,
    "reasoning": "This source is credible because..."
  }'
```

### Test Leaderboard
```bash
curl http://localhost:3000/api/agents/leaderboard?limit=10
```

### Test Agent Performance
```bash
curl http://localhost:3000/api/agents/[agent-id]/performance
```

## ⚠️ Troubleshooting

### Migration Fails with "relation already exists"
- Some tables might already exist from previous migrations
- This is okay - the migrations use `IF NOT EXISTS`
- Check which specific error occurred

### "Function calculate_brier_score does not exist"
- P4 migration might not have run completely
- Re-run the P4 migration SQL

### No pre-seeded sources in source_reputation
- Check if the INSERT statements ran
- You can manually run just the INSERT section from the migration

### Agent performance not updating
- Check if triggers were created: `trigger_init_agent_performance`
- Verify agent_performance records exist for your agents

## 📋 Migration Files

- `supabase/migrations/20260213_evidence_credibility_system.sql` (P2)
- `supabase/migrations/20260213_agent_participation_system.sql` (P4)

## 🔍 Verification Queries

### Check P2 tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('source_reputation', 'fact_checker_reputation', 'claim_consensus', 'google_factcheck_cache');
```

### Check P4 tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agent_predictions', 'agent_claim_participation', 'agent_performance', 'agent_execution_queue');
```

### Check functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%agent%' OR routine_name LIKE '%brier%';
```

## 📚 Documentation

- [P2: Evidence Credibility System](./docs/P2_EVIDENCE_CREDIBILITY_SYSTEM.md)
- [P4: Agent Participation System](./docs/P4_AGENT_PARTICIPATION_COMPLETE.md)
- [P4: Implementation Plan](./docs/P4_AGENT_PARTICIPATION_PLAN.md)

## ✅ Ready for Beta!

Once migrations are applied and tested:
1. ✅ P1: Verdict System (complete)
2. ✅ P2: Evidence Credibility (complete)
3. ✅ P4: Agent Participation (complete)
4. 🚀 Ready for Beta Launch!

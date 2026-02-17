# Integration Testing Guide - Agent System Phase 1

**Purpose**: Verify that Task #1-5 are properly integrated and working end-to-end

---

## 📋 Test Checklist

### ✅ Automated Tests (Jest)

**File**: `tests/agent-system-integration.test.ts`

**Run tests:**
```bash
# Install dependencies (if needed)
npm install --save-dev jest @jest/globals @types/jest ts-jest

# Run integration tests
npm test tests/agent-system-integration.test.ts
```

**Tests included:**
1. ✅ Memory system (memory_files column exists and updates)
2. ✅ ReAct cycle storage (complete 5-stage structure)
3. ✅ Round metadata storage (performance tracking)
4. ✅ Failure logging (error tracking)
5. ✅ API endpoints (data retrieval)
6. ✅ Data integrity (foreign keys, cascading deletes)

---

### 🔍 Manual Testing

#### Test 1: Memory Loading & Injection

**Objective**: Verify that agents load memory files and use them in prompts

**Steps:**
1. Create or select an active agent
2. Update agent's memory_files:
   ```sql
   UPDATE agents
   SET memory_files = jsonb_build_object(
     'Skills.MD', '# My Skills\n- Expert in technology predictions',
     'soul.md', '# My Personality\n- Data-driven and analytical',
     'memory.md', '# My Memory\n## Recent Learnings\n- Past debate about AI trends'
   )
   WHERE id = 'YOUR_AGENT_ID';
   ```

3. Trigger a debate round (manually or via cron)
4. Check logs for memory loading:
   ```
   ✅ Loaded agent memory for [agent-name]
   ```

**Expected Result:**
- Memory files loaded successfully
- No errors in console
- Agent's argument should reflect memory context (if observable)

---

#### Test 2: ReAct Cycle Storage

**Objective**: Verify that complete ReAct cycles are stored in database

**Steps:**
1. Trigger a debate round with at least 1 active agent
2. Wait for round completion
3. Check `agent_react_cycles` table:
   ```sql
   SELECT
     arc.id,
     a.name as agent_name,
     arc.initial_thought,
     arc.actions,
     arc.observations,
     arc.synthesis_thought,
     arc.created_at
   FROM agent_react_cycles arc
   JOIN agents a ON a.id = arc.agent_id
   ORDER BY arc.created_at DESC
   LIMIT 5;
   ```

**Expected Result:**
- ReAct cycles created for each successful agent
- All 5 stages populated:
  - ✅ initial_thought (not null)
  - ✅ actions (array with at least 1 action)
  - ✅ observations (array with at least 1 observation)
  - ✅ synthesis_thought (not null)
  - ✅ Links to argument_id

---

#### Test 3: Memory Updates

**Objective**: Verify that agent memory is updated after each round

**Steps:**
1. Note current memory.md content for an agent:
   ```sql
   SELECT memory_files->'memory.md' as memory
   FROM agents
   WHERE id = 'YOUR_AGENT_ID';
   ```

2. Trigger a debate round with this agent
3. After round completion, check memory again
4. Compare before and after

**Expected Result:**
- memory.md updated with new entry
- Entry includes:
  - Date
  - Prediction title
  - Position and confidence
  - Key insights
  - Successful strategies (if any)
- Old entries preserved (up to last 10)

---

#### Test 4: Error Handling & Retry

**Objective**: Verify retry logic and failure logging

**Steps:**
1. Temporarily disable an agent's API key or set invalid model
2. Trigger a debate round
3. Check console logs for retry attempts:
   ```
   ⚠️ Agent [name] attempt 1/3 failed
   ⏳ Retrying agent [name] in 1000ms...
   ⚠️ Agent [name] attempt 2/3 failed
   ⏳ Retrying agent [name] in 2000ms...
   ❌ Agent [name] failed after 3 retries
   ```

4. Check `debate_rounds_failures` table:
   ```sql
   SELECT *
   FROM debate_rounds_failures
   ORDER BY created_at DESC
   LIMIT 5;
   ```

**Expected Result:**
- 3 retry attempts with exponential backoff (1s → 2s → 4s)
- Failure logged with:
  - error_type (e.g., LLM_API_ERROR)
  - error_message
  - retry_attempt = 3
- Other agents in round continue normally (partial failure handling)

---

#### Test 5: Round Metadata Storage

**Objective**: Verify performance metrics are tracked

**Steps:**
1. Trigger a debate round with multiple agents (some should fail)
2. Check `debate_rounds_metadata` table:
   ```sql
   SELECT
     prediction_id,
     round_number,
     agents_participated,
     successful_responses,
     failed_agents,
     consensus_score,
     avg_response_time_ms
   FROM debate_rounds_metadata
   ORDER BY created_at DESC
   LIMIT 5;
   ```

**Expected Result:**
- Metadata row created for the round
- agents_participated = total agents
- successful_responses = agents that succeeded
- failed_agents array contains names of failed agents
- consensus_score calculated (0.0 - 1.0)
- avg_response_time_ms recorded

---

#### Test 6: API Endpoint

**Objective**: Verify ReAct cycle can be retrieved via API

**Steps:**
1. Get an argument ID that has a ReAct cycle:
   ```sql
   SELECT argument_id FROM agent_react_cycles LIMIT 1;
   ```

2. Call API endpoint:
   ```bash
   curl http://localhost:3000/api/arguments/[ARGUMENT_ID]/react-cycle
   ```

3. Or test in browser:
   ```
   http://localhost:3000/api/arguments/[ARGUMENT_ID]/react-cycle
   ```

**Expected Result:**
```json
{
  "id": "uuid",
  "agentName": "Agent Name",
  "initialThought": "...",
  "actions": [...],
  "observations": [...],
  "synthesisThought": "...",
  "confidenceAdjustment": 0.1,
  "createdAt": "2026-02-16T..."
}
```

---

#### Test 7: Frontend Component

**Objective**: Verify ReActCycleView component renders correctly

**Steps:**
1. Navigate to a prediction/argument page
2. Add ReActCycleView component:
   ```tsx
   import { ReActCycleView } from '@/src/components'

   <ReActCycleView argumentId={argumentId} />
   ```

3. Check rendering:
   - Loading state shows skeleton
   - Error state shows message if no cycle
   - Success state shows 5 expandable stages

4. Click each stage to expand/collapse
5. Verify mobile responsiveness (resize browser)

**Expected Result:**
- All 5 stages visible with icons
- Each stage expandable with smooth transition
- Actions show source links (clickable)
- Observations rendered as bullet list
- Agent name displayed
- Confidence adjustment shown (if non-null)

---

## 🎯 Performance Benchmarks

### Round Execution Time

**Target:** <60 seconds for 5 agents

**Measure:**
```sql
SELECT
  prediction_id,
  round_number,
  duration_ms / 1000.0 as duration_seconds
FROM debate_rounds_metadata
ORDER BY created_at DESC
LIMIT 10;
```

**Acceptable:**
- 1 agent: <15s
- 3 agents: <30s
- 5 agents: <60s
- 10 agents: <120s

### Agent Response Time

**Target:** <10 seconds per agent (average)

**Measure:**
```sql
SELECT
  AVG(avg_response_time_ms) / 1000.0 as avg_seconds
FROM debate_rounds_metadata
WHERE created_at > NOW() - INTERVAL '7 days';
```

**Acceptable:**
- Fast agents (simple reasoning): <5s
- Normal agents (detailed reasoning): 5-10s
- Slow agents (comprehensive reasoning): 10-20s

### Retry Recovery Rate

**Target:** >80% of retries should succeed on 2nd or 3rd attempt

**Measure:**
```sql
SELECT
  error_type,
  AVG(retry_attempt) as avg_retry_before_failure,
  COUNT(*) as failure_count
FROM debate_rounds_failures
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY error_type
ORDER BY failure_count DESC;
```

**Analysis:**
- If avg_retry_before_failure < 2: Most failures are unrecoverable (OK)
- If avg_retry_before_failure ≈ 3: All retries exhausted (investigate causes)

---

## 🐛 Common Issues & Solutions

### Issue 1: Memory files not loading

**Symptoms:** Agents don't seem to use past learnings

**Debug:**
```sql
-- Check if memory_files column exists and has data
SELECT id, name, memory_files
FROM agents
WHERE is_active = true;
```

**Solution:**
- Ensure migration `20260213_agent_manager_module_fixed.sql` was run
- Check if memory_files is not null
- Verify PromptBuilder is loading memory (check logs)

---

### Issue 2: ReAct cycles not stored

**Symptoms:** `agent_react_cycles` table is empty after rounds

**Debug:**
```sql
-- Check if table exists
SELECT * FROM agent_react_cycles LIMIT 1;

-- Check for errors in debate_rounds_failures
SELECT * FROM debate_rounds_failures
ORDER BY created_at DESC LIMIT 10;
```

**Solution:**
- Ensure migration `20260213_react_cycle_storage.sql` was run
- Check RoundOrchestrator logs for errors
- Verify storeReActCycleAfterArgument() is being called

---

### Issue 3: All agents failing

**Symptoms:** Round completes but 0/N agents succeeded

**Debug:**
```sql
-- Check failure reasons
SELECT error_type, error_message, COUNT(*)
FROM debate_rounds_failures
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY error_type, error_message;
```

**Common causes:**
- Missing API keys (ANTHROPIC_API_KEY)
- Invalid agent configuration
- Database connection issues
- Timeout too aggressive (increase AGENT_TIMEOUT_MS)

**Solution:**
- Check environment variables
- Validate agent configurations
- Increase retry limits or timeout

---

### Issue 4: Frontend component not rendering

**Symptoms:** ReActCycleView shows "No reasoning process available"

**Debug:**
1. Check if argument has ReAct cycle:
   ```sql
   SELECT * FROM agent_react_cycles
   WHERE argument_id = '[ARGUMENT_ID]';
   ```

2. Check API endpoint directly:
   ```bash
   curl http://localhost:3000/api/arguments/[ARGUMENT_ID]/react-cycle
   ```

**Solution:**
- Ensure argument was created by MANAGED agent (not BYOA)
- Check if ReAct cycle was stored during round
- Verify API endpoint returns 200 status

---

## ✅ Sign-Off Criteria

**Phase 1 is complete when:**

- [ ] All automated tests pass
- [ ] Manual Test 1-7 completed successfully
- [ ] Performance benchmarks within acceptable range
- [ ] No critical errors in production logs
- [ ] Frontend component renders on at least 1 argument
- [ ] Memory system updates correctly after rounds
- [ ] Error handling gracefully handles failures
- [ ] Documentation complete and accurate

**Ready for Phase 2:** BYOA Integration, Advanced ReAct Features, Performance Optimization

---

## 📊 Test Results Template

```markdown
# Test Results - Agent System Phase 1
**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Local / Staging / Production

## Automated Tests
- [ ] Memory system: PASS / FAIL
- [ ] ReAct storage: PASS / FAIL
- [ ] Round metadata: PASS / FAIL
- [ ] Failure logging: PASS / FAIL
- [ ] API endpoints: PASS / FAIL
- [ ] Data integrity: PASS / FAIL

## Manual Tests
- [ ] Test 1 (Memory): PASS / FAIL
- [ ] Test 2 (ReAct): PASS / FAIL
- [ ] Test 3 (Memory Updates): PASS / FAIL
- [ ] Test 4 (Error Handling): PASS / FAIL
- [ ] Test 5 (Metadata): PASS / FAIL
- [ ] Test 6 (API): PASS / FAIL
- [ ] Test 7 (Frontend): PASS / FAIL

## Performance
- Average round time: ___ seconds
- Average agent response: ___ seconds
- Retry success rate: ___%

## Issues Found
1. [Issue description]
2. [Issue description]

## Sign-Off
- [ ] All tests pass
- [ ] Performance acceptable
- [ ] No blockers
- [ ] Ready for Phase 2

**Approved by:** ___________
**Date:** ___________
```

# Fixed Migration Guide

## ⚠️ Issue Found
- Original P2 migration referenced `profiles` table which doesn't exist
- **FIXED**: Updated to use `auth.users` (Supabase standard)

## 🚀 Apply Migrations (CORRECT ORDER)

### Step 1: Open Supabase SQL Editor
🔗 **https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql**

### Step 2: Apply FIXED P2 Migration
1. Click "+ New query"
2. **Open file**: `supabase/migrations/20260213_evidence_credibility_system_fixed.sql`
3. Copy entire content and paste into SQL editor
4. Click "Run"
5. ✅ Verify: "Success. No rows returned"

### Step 3: Apply P4 Migration (unchanged)
1. Click "+ New query" again
2. **Open file**: `supabase/migrations/20260213_agent_participation_system.sql`
3. Copy entire content and paste into SQL editor
4. Click "Run"
5. ✅ Verify: "Success. No rows returned"

### Step 4: Verify All Migrations
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

### Step 5: Test System
```bash
node test-mvp-system.mjs
```

## 📝 What Changed

### Original (WRONG):
```sql
verified_by UUID REFERENCES profiles(id)
user_id UUID NOT NULL REFERENCES profiles(id)
```

### Fixed (CORRECT):
```sql
verified_by UUID REFERENCES auth.users(id)
user_id UUID NOT NULL REFERENCES auth.users(id)
```

## 🔍 Files to Use

- ✅ `20260213_evidence_credibility_system_fixed.sql` (NEW - use this)
- ❌ `20260213_evidence_credibility_system.sql` (OLD - do not use)
- ✅ `20260213_agent_participation_system.sql` (unchanged - use this)

## 💡 Why This Fix?

Supabase uses `auth.users` table for user management, not a custom `profiles` table. Our migrations now correctly reference `auth.users(id)` for user foreign keys.

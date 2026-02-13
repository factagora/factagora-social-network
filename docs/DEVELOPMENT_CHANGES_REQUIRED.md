# Development Changes Required for Claims/Predictions Separation

**Date**: 2026-02-10
**Priority**: High
**Impact**: Database, API, UI

---

## 🔍 Current vs Desired State

### Current Schema Issues

**Problem**: Claims table is designed for Predictions (future events)
```sql
-- Current (Wrong for fact-checking)
CREATE TABLE claims (
  resolution_date TIMESTAMPTZ,      -- For future predictions
  resolution_value BOOLEAN,          -- Simple TRUE/FALSE
  verification_status VARCHAR(20)    -- Generic status
);
```

**What Fact-Checking Needs**:
```sql
-- Desired (Right for fact-checking)
CREATE TABLE claims (
  claimed_by TEXT,                   -- WHO made the claim
  claim_date TIMESTAMPTZ,            -- WHEN was it claimed
  verdict VARCHAR(20),               -- TRUE/FALSE/PARTIALLY_TRUE/UNVERIFIED/MISLEADING
  verdict_summary TEXT,              -- Short explanation
  verdict_date TIMESTAMPTZ,          -- When verdict was reached
  source_credibility INTEGER,        -- 0-100 credibility score

  -- Keep these for compatibility
  resolution_date TIMESTAMPTZ NULL,  -- Optional (mainly for predictions)
  resolution_value BOOLEAN,          -- Keep for backward compatibility
);
```

---

## 🔧 Required Changes

### 1. Database Schema Changes

#### Priority: HIGH
**File**: `supabase/migrations/20260211_claims_factchecking_fields.sql`

```sql
-- Add fact-checking specific fields
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS claim_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
    CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING')),
  ADD COLUMN IF NOT EXISTS verdict_summary TEXT,
  ADD COLUMN IF NOT EXISTS verdict_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_credibility INTEGER DEFAULT 50
    CHECK (source_credibility >= 0 AND source_credibility <= 100);

-- Make resolution_date nullable (not required for fact-checking)
ALTER TABLE claims
  ALTER COLUMN resolution_date DROP NOT NULL;

-- Add index for verdict filtering
CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
CREATE INDEX IF NOT EXISTS idx_claims_claim_date ON claims(claim_date DESC);

-- Update existing claims to have default verdict
UPDATE claims
SET verdict = 'UNVERIFIED'
WHERE verdict IS NULL;
```

**Impact**:
- ✅ Supports fact-checking workflow
- ✅ Backward compatible (keeps old fields)
- ✅ Allows verdict beyond TRUE/FALSE
- ⚠️ Need to update all API endpoints
- ⚠️ Need to update UI components

---

### 2. Type Definitions Update

#### Priority: HIGH
**File**: `src/types/claim.ts`

```typescript
// Current (incomplete)
export interface Claim {
  id: string
  title: string
  description: string
  category?: string
  resolutionDate?: string | null
  createdBy: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  resolvedAt?: string | null
  resolutionValue?: boolean | null
  verificationStatus: 'PENDING' | 'VERIFIED' | 'DISPUTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

// ADD THESE FIELDS:
export interface Claim {
  // ... existing fields ...

  // NEW: Fact-checking specific
  claimedBy?: string           // Who made the original claim
  claimDate?: string           // When was it claimed
  verdict?: ClaimVerdict       // Fact-check verdict
  verdictSummary?: string      // Short explanation
  verdictDate?: string         // When verdict was reached
  sourceCredibility?: number   // 0-100 score
}

export type ClaimVerdict =
  | 'TRUE'
  | 'FALSE'
  | 'PARTIALLY_TRUE'
  | 'UNVERIFIED'
  | 'MISLEADING'

export const VERDICT_LABELS: Record<ClaimVerdict, string> = {
  TRUE: 'True',
  FALSE: 'False',
  PARTIALLY_TRUE: 'Partially True',
  UNVERIFIED: 'Unverified',
  MISLEADING: 'Misleading'
}

export const VERDICT_COLORS: Record<ClaimVerdict, string> = {
  TRUE: 'green',
  FALSE: 'red',
  PARTIALLY_TRUE: 'yellow',
  UNVERIFIED: 'gray',
  MISLEADING: 'orange'
}
```

**Impact**:
- ✅ Type safety for new fields
- ✅ Clear verdict options
- ⚠️ Update all components using Claim type

---

### 3. API Endpoint Updates

#### Priority: HIGH

**Files to Update**:
- `app/api/claims/route.ts` (GET/POST)
- `app/api/claims/[id]/route.ts` (GET/PATCH)
- `app/api/claims/[id]/resolve/route.ts` (NEW - for verdict)

#### A. GET /api/claims (List)

```typescript
// ADD: Filter by verdict
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const verdict = searchParams.get('verdict') // NEW

  let query = supabase
    .from('claims')
    .select(`
      id, title, description, category,
      created_by, approval_status,
      resolution_date, resolved_at, resolution_value,

      -- ADD THESE:
      claimed_by, claim_date, verdict, verdict_summary, source_credibility
    `)

  // ADD: Filter by verdict
  if (verdict) {
    query = query.eq('verdict', verdict)
  }

  // ... rest of query
}
```

#### B. POST /api/claims (Create)

```typescript
// ADD: Support new fields in creation
export async function POST(request: NextRequest) {
  const body = await request.json()

  const claim = {
    title: body.title,
    description: body.description,
    category: body.category,
    created_by: session.user.id,

    // ADD THESE (optional):
    claimed_by: body.claimedBy,
    claim_date: body.claimDate,
    source_credibility: body.sourceCredibility || 50,
    verdict: 'UNVERIFIED' // Default
  }

  // ... insert claim
}
```

#### C. NEW: PATCH /api/claims/[id]/verdict

```typescript
// NEW ENDPOINT: Set verdict on claim
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: claimId } = await params

  // Check authentication (fact-checker role?)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { verdict, verdictSummary } = body

  // Validate verdict
  const validVerdicts = ['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING']
  if (!validVerdicts.includes(verdict)) {
    return NextResponse.json({ error: 'Invalid verdict' }, { status: 400 })
  }

  // Update claim verdict
  const { data, error } = await supabase
    .from('claims')
    .update({
      verdict,
      verdict_summary: verdictSummary,
      verdict_date: new Date().toISOString(),
      verification_status: 'VERIFIED'
    })
    .eq('id', claimId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ claim: data })
}
```

**Impact**:
- ✅ Support fact-checking workflow
- ✅ Filter by verdict
- ⚠️ Need to update frontend to use new endpoints

---

### 4. UI Component Updates

#### Priority: HIGH

#### A. Verdict Badge Component

**File**: `src/components/claim/VerdictBadge.tsx` (NEW)

```typescript
import { ClaimVerdict, VERDICT_LABELS, VERDICT_COLORS } from '@/types/claim'

interface VerdictBadgeProps {
  verdict: ClaimVerdict
  size?: 'sm' | 'md' | 'lg'
}

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  const colors = {
    TRUE: 'bg-green-500/20 text-green-400 border-green-500/50',
    FALSE: 'bg-red-500/20 text-red-400 border-red-500/50',
    PARTIALLY_TRUE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    UNVERIFIED: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    MISLEADING: 'bg-orange-500/20 text-orange-400 border-orange-500/50'
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${colors[verdict]}
      ${sizes[size]}
    `}>
      {VERDICT_LABELS[verdict]}
    </span>
  )
}
```

#### B. Update ClaimCard Component

**File**: `src/components/cards/ClaimCard.tsx`

```typescript
// ADD: Import verdict badge
import { VerdictBadge } from '@/components/claim/VerdictBadge'

export default function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <Link href={`/claims/${claim.id}`}>
      <div className="...">
        {/* ADD: Show verdict if available */}
        {claim.verdict && (
          <div className="mb-2">
            <VerdictBadge verdict={claim.verdict} size="sm" />
          </div>
        )}

        <h3>{claim.title}</h3>

        {/* ADD: Show claimed by and date */}
        {claim.claimedBy && (
          <p className="text-sm text-slate-400 mt-2">
            Claimed by: <span className="font-medium">{claim.claimedBy}</span>
            {claim.claimDate && (
              <> on {new Date(claim.claimDate).toLocaleDateString()}</>
            )}
          </p>
        )}

        {/* Rest of component */}
      </div>
    </Link>
  )
}
```

#### C. Update Claim Detail Page

**File**: `app/claims/[id]/page.tsx`

```typescript
// ADD: Show verdict prominently
export default async function ClaimDetailPage({ params }: Props) {
  // ... fetch claim ...

  return (
    <div>
      <h1>{claimData.title}</h1>

      {/* ADD: Verdict display */}
      {claimData.verdict ? (
        <div className="my-6 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-slate-400 font-medium">Verdict:</span>
            <VerdictBadge verdict={claimData.verdict} size="lg" />
          </div>

          {claimData.verdictSummary && (
            <p className="text-slate-300">{claimData.verdictSummary}</p>
          )}

          {claimData.verdictDate && (
            <p className="text-sm text-slate-500 mt-2">
              Verified on {new Date(claimData.verdictDate).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : (
        <div className="my-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/50">
          <p className="text-yellow-400">
            ⚠️ This claim has not been verified yet. Help by submitting evidence!
          </p>
        </div>
      )}

      {/* ADD: Claimed by section */}
      {claimData.claimedBy && (
        <div className="mb-6">
          <span className="text-slate-400">Originally claimed by: </span>
          <span className="font-medium text-white">{claimData.claimedBy}</span>
          {claimData.claimDate && (
            <span className="text-slate-500 ml-2">
              on {new Date(claimData.claimDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Rest of page */}
    </div>
  )
}
```

---

### 5. Seed Data Update

#### Priority: MEDIUM

**File**: `scripts/seed-real-claims.mjs`

```javascript
// UPDATE: Add new fields to seed data
const realClaims = [
  {
    title: "Elon Musk stated Tesla produced 1.8 million vehicles in 2025",
    description: "...",
    category: "Business",

    // ADD THESE:
    claimed_by: "Elon Musk",
    claim_date: "2026-01-02T00:00:00Z",
    source_credibility: 85,
    verdict: 'TRUE', // If verified
    verdict_summary: "Confirmed by Tesla Q4 2025 Production Report",
    verdict_date: "2026-01-03T00:00:00Z",

    resolution_date: null, // Not needed for fact-checking
    created_by: testUser.id,
    approval_status: 'APPROVED'
  },
  // ... other claims
]
```

---

## 📊 Implementation Priority

### Phase 1: Critical (This Week)
1. ✅ Database migration (add new fields)
2. ✅ Update TypeScript types
3. ✅ Update API endpoints to return new fields
4. ✅ Create VerdictBadge component
5. ✅ Update ClaimCard to show verdict

### Phase 2: Important (Next Week)
1. ✅ Add verdict endpoint (PATCH /api/claims/[id]/verdict)
2. ✅ Update claim detail page UI
3. ✅ Add verdict filter to claims list
4. ✅ Update seed data with new fields

### Phase 3: Enhancement (Week 3)
1. ⬜ Add verdict voting/consensus mechanism
2. ⬜ Add source credibility calculation
3. ⬜ Add fact-checker role/permissions
4. ⬜ Add verdict history tracking

---

## 🧪 Testing Requirements

### After Phase 1
- [ ] Old claims still display correctly
- [ ] New claims show verdict badge
- [ ] API returns new fields
- [ ] No breaking changes to existing UI

### After Phase 2
- [ ] Can set verdict via API
- [ ] Verdict displays prominently
- [ ] Can filter by verdict
- [ ] Verdict changes are tracked

### After Phase 3
- [ ] Community can vote on verdict
- [ ] Source credibility calculated
- [ ] Fact-checker permissions work
- [ ] History shows verdict changes

---

## ⚠️ Breaking Changes

### Minimal Breaking Changes
- ✅ Backward compatible (keep old fields)
- ✅ New fields are optional
- ✅ Old queries still work
- ⚠️ UI will look different (verdict badges)

### Migration Strategy
1. Add new columns (don't remove old ones)
2. Populate new columns with defaults
3. Update UI to use new fields
4. Gradually deprecate old fields
5. Remove old fields in future version

---

## 🎯 Expected Outcome

### Before (Current)
```
Claim: "ChatGPT-5가 2026년 상반기에 출시될 것이다"
Status: PENDING
Resolution Date: 2026-06-30
```
**Problem**: This is a prediction, not a fact-check claim

### After (Desired)
```
Claim: "Elon Musk stated Tesla produced 1.8M vehicles in 2025"
Claimed By: Elon Musk
Claim Date: January 2, 2026
Verdict: ✅ TRUE
Summary: "Confirmed by Tesla Q4 2025 Production Report"
Source Credibility: 85/100
```
**Correct**: This is verifiable fact-checking

---

## 📋 Implementation Checklist

- [ ] Create migration file
- [ ] Run migration on database
- [ ] Update TypeScript types
- [ ] Update API GET endpoints
- [ ] Update API POST endpoints
- [ ] Create PATCH verdict endpoint
- [ ] Create VerdictBadge component
- [ ] Update ClaimCard component
- [ ] Update claim detail page
- [ ] Update seed data script
- [ ] Test all changes
- [ ] Update documentation

---

**Estimated Time**: 2-3 days for Phase 1
**Priority**: HIGH - Needed to properly support fact-checking
**Risk**: LOW - Backward compatible approach

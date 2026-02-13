# P2: Evidence Credibility Automation System

**Status**: ✅ Code Complete - Migration Pending
**Implementation Date**: February 13, 2026
**Timeline**: Day 1-2 of MVP Development

## 🎯 Overview

The Evidence Credibility Automation System transforms Factagora's fact-checking capabilities by automatically scoring evidence based on source reputation, enabling consensus-driven verdicts, and integrating with Google's Fact Check API for external verification.

## 📊 Key Features

### 1. **Source Reputation Tracking**
- Database of 17+ pre-seeded trusted sources (news outlets, academic journals, fact-checkers)
- Automatic credibility scoring (0-100 scale)
- Bias rating (LEFT, CENTER_LEFT, CENTER, CENTER_RIGHT, RIGHT)
- Source type classification (NEWS_OUTLET, ACADEMIC, GOVERNMENT, FACT_CHECKER, etc.)

### 2. **Evidence Credibility Scoring**
- Automatic calculation based on:
  - Source reputation (70% weight)
  - Verification status (20% bonus if verified by fact-checker)
  - Base reliability score (30% weight)
- Real-time updates via database triggers

### 3. **Consensus Mechanism**
- Tracks community votes (TRUE/FALSE)
- Evidence-weighted consensus score (-100 to +100)
- Confidence levels (HIGH, MEDIUM, LOW, NONE)
- Automatic verdict recommendations

### 4. **Google Fact Check API Integration**
- Cached API results (7-day TTL) to minimize costs
- Batch search support (up to 10 queries)
- Automatic domain extraction and matching

### 5. **Fact-Checker Reputation System**
- Track accuracy of users who verify claims
- Reputation scores (0-100)
- Expertise areas tracking
- Streak bonuses for consistent verification

## 🗄️ Database Schema

### New Tables

#### `source_reputation`
```sql
- domain (unique) - e.g., "nytimes.com"
- source_name - Display name
- source_type - Classification
- credibility_score (0-100)
- verification_count
- accuracy_rate (0-100)
- bias_rating
- fact_check_rating
```

#### `fact_checker_reputation`
```sql
- user_id (unique)
- reputation_score (0-100)
- total_verifications
- accurate_verifications
- accuracy_rate
- expertise_areas (array)
- current_streak
- longest_streak
```

#### `claim_consensus`
```sql
- claim_id (unique)
- true_votes, false_votes, total_votes
- true_percentage
- evidence_weighted_score (-100 to +100)
- consensus_reached (boolean)
- consensus_threshold (default 70%)
- confidence_level (HIGH/MEDIUM/LOW/NONE)
```

#### `google_factcheck_cache`
```sql
- query_text
- query_hash (unique)
- fact_check_results (JSONB)
- claims_found
- expires_at (7 days default)
```

### Enhanced Tables

#### `claim_evidence` (new columns)
```sql
- credibility_score (0-100)
- source_domain
- source_reputation_id
- verified_by
- verified_at
- verification_notes
```

## 🔌 API Endpoints

### Google Fact Check API
```
GET  /api/factcheck/google?query=<text>&languageCode=en&pageSize=10
POST /api/factcheck/google/batch
     Body: { queries: string[] }
```

### Source Reputation
```
GET  /api/sources/[domain]
POST /api/sources/[domain]
     Body: { sourceName, sourceType, credibilityScore, biasRating }
GET  /api/sources/lookup?url=<url>
```

### Consensus
```
GET  /api/claims/[id]/consensus
POST /api/claims/[id]/consensus/recalculate
GET  /api/claims/[id]/consensus/recommendation
```

## 🎨 UI Components

### `<CredibilityBadge />`
```tsx
<CredibilityBadge
  score={85}
  size="md"
  showLabel={true}
  showScore={true}
/>
```

### `<SourceReputationBadge />`
```tsx
<SourceReputationBadge
  domain="nytimes.com"
  credibilityScore={80}
  sourceName="The New York Times"
  sourceType="NEWS_OUTLET"
  compact={false}
/>
```

### `<ConsensusIndicator />`
```tsx
<ConsensusIndicator
  claimId={claimId}
  showBreakdown={true}
  autoRefresh={true}
/>
```

## 📝 TypeScript Types

Located in `/src/types/credibility.ts`:

- `SourceReputation`
- `FactCheckerReputation`
- `ClaimConsensus`
- `EnhancedEvidence`
- `GoogleFactCheckClaim`
- `GoogleFactCheckReview`
- `CredibilityFactors`
- `ConsensusResult`

## 🚀 Migration Instructions

### Step 1: Apply Database Migration

1. Go to Supabase SQL Editor:
   https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql

2. Click "+ New query"

3. Copy contents from:
   `supabase/migrations/20260213_evidence_credibility_system.sql`

4. Paste and click "Run"

5. Verify success:
   ```bash
   node run-credibility-migration.mjs
   ```

### Step 2: Configure Google Fact Check API (Optional)

1. Get API key from:
   https://console.cloud.google.com/apis/library/factchecktools.googleapis.com

2. Add to `.env.local`:
   ```
   GOOGLE_FACTCHECK_API_KEY=your_api_key_here
   ```

3. Test API:
   ```bash
   curl "http://localhost:3000/api/factcheck/google?query=climate+change"
   ```

## 🔄 Automatic Triggers

### Evidence Credibility Calculation
- **Trigger**: After INSERT or UPDATE on `claim_evidence`
- **Action**: Calls `calculate_evidence_credibility()` function
- **Updates**: `credibility_score` field automatically

### Consensus Update
- **Trigger**: After INSERT or UPDATE on `claim_votes`
- **Action**: Calls `update_claim_consensus()` function
- **Updates**: All consensus metrics automatically

## 🎯 Usage Examples

### 1. Submit Evidence with Automatic Credibility Scoring
```typescript
// Evidence is submitted via existing API
// Credibility score is automatically calculated via trigger
POST /api/claims/[id]/evidence
Body: {
  content: "Study shows...",
  sourceUrl: "https://nature.com/article/123"
}

// Response includes credibility_score automatically
```

### 2. Check Consensus Before Setting Verdict
```typescript
// Get consensus data
const consensus = await fetch(`/api/claims/${claimId}/consensus`)
  .then(r => r.json())

// Get verdict recommendation
const recommendation = await fetch(
  `/api/claims/${claimId}/consensus/recommendation`
).then(r => r.json())

// recommendation.recommendedVerdict: 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIED' | 'MISLEADING'
// recommendation.confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
```

### 3. Lookup Source Reputation
```typescript
// By domain
const source = await fetch('/api/sources/nytimes.com')
  .then(r => r.json())
// Returns: { credibilityScore: 80, sourceName: "The New York Times", ... }

// By full URL
const source = await fetch('/api/sources/lookup?url=https://www.nytimes.com/article/123')
  .then(r => r.json())
```

### 4. Search Google Fact Check API
```typescript
// Single query
const factChecks = await fetch(
  '/api/factcheck/google?query=climate+change+hoax'
).then(r => r.json())
// Returns: { claims: [...], cached: false }

// Batch queries
const results = await fetch('/api/factcheck/google/batch', {
  method: 'POST',
  body: JSON.stringify({
    queries: ['climate change', 'vaccine safety', 'election results']
  })
}).then(r => r.json())
```

## 📊 Pre-Seeded Sources

### News Outlets (credibility: 80-90)
- Associated Press (90)
- Reuters (90)
- BBC News (85)
- The New York Times (80)
- The Wall Street Journal (80)

### Fact-Checkers (credibility: 90-95)
- Snopes (95)
- FactCheck.org (95)
- PolitiFact (90)

### Academic (credibility: 95)
- arXiv
- Nature
- Science Magazine

### Government (credibility: 90)
- CDC
- NIH
- NASA

### Social Media (credibility: 30-35)
- Twitter/X (30)
- Facebook (30)
- Reddit (35)

## 🔐 Security & Permissions

### Row Level Security (RLS)
- ✅ Public read access for source reputation
- ✅ Admin-only write access for source reputation
- ✅ Public read access for consensus data
- ✅ Users can view fact-checker reputation
- ✅ Public read access for Google Fact Check cache

### API Rate Limiting
- Google Fact Check API: 7-day cache to minimize costs
- Batch requests: Maximum 10 queries per request

## 🧪 Testing

### Manual Testing Steps

1. **Apply Migration**
   ```bash
   node run-credibility-migration.mjs
   ```

2. **Test Source Reputation**
   ```bash
   curl http://localhost:3000/api/sources/nytimes.com
   ```

3. **Test Evidence Credibility**
   - Submit evidence with source URL
   - Verify `credibility_score` is calculated
   - Check `source_domain` is extracted

4. **Test Consensus**
   ```bash
   # Submit votes for a claim
   # Then check consensus
   curl http://localhost:3000/api/claims/[id]/consensus
   ```

5. **Test Google Fact Check API**
   ```bash
   curl "http://localhost:3000/api/factcheck/google?query=climate+change"
   ```

## 📈 Performance Optimizations

- **Caching**: Google Fact Check API results cached for 7 days
- **Indexes**: Added on `domain`, `credibility_score`, `query_hash`, `expires_at`
- **Triggers**: Automatic calculations prevent manual recalculation
- **Batch Operations**: Support for batch fact-check lookups

## 🚧 Future Enhancements (Not in MVP)

- [ ] Machine learning model for credibility prediction
- [ ] User reputation decay over time
- [ ] Multi-language fact-check support
- [ ] External fact-checker API integrations (beyond Google)
- [ ] Automated source verification pipeline
- [ ] Claim similarity detection
- [ ] Evidence quality scoring beyond just source reputation

## 📚 Related Documentation

- [P1: Verdict System](./PHASE_8_COMPLETE.md)
- [Product Strategy](./PRODUCT_STRATEGY.md)
- [Claims System](./CLAIMS_REDESIGN_COMPLETE.md)

## ✅ P2 Completion Checklist

- [x] Database schema designed
- [x] Migration SQL created
- [x] TypeScript types defined
- [x] Google Fact Check API integration
- [x] Source reputation API
- [x] Consensus calculation API
- [x] UI components (CredibilityBadge, ConsensusIndicator)
- [x] Documentation completed
- [ ] Migration applied to production database
- [ ] Google Fact Check API key configured
- [ ] Integration testing completed
- [ ] UI components integrated into claim pages

## 🎉 Impact

**Before P2**:
- No automatic evidence evaluation
- Manual source checking required
- No consensus mechanism
- Limited verdict confidence

**After P2**:
- ✅ Automatic evidence credibility scoring
- ✅ 17+ pre-seeded trusted sources
- ✅ Real-time consensus tracking
- ✅ Evidence-weighted verdict recommendations
- ✅ Google Fact Check API integration
- ✅ Fact-checker reputation tracking

**Expected Outcomes**:
- 🚀 50% reduction in manual fact-checking effort
- 📊 Higher quality verdicts with confidence scores
- 🎯 Better user trust through transparent credibility metrics
- ⚡ Faster claim resolution through consensus automation

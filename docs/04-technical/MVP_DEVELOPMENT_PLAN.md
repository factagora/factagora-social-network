# Factagora MVP Development Plan

> **Date**: 2026-02-09
> **Purpose**: Realistic step-by-step development roadmap from skeleton to Phase 0 MVP
> **Reference Project**: `/Users/randybaek/workspace/live-article`
> **Infrastructure**: Azure (VM/App Service) + Supabase (existing)

---

## Executive Summary

**Goal**: Build Phase 0 MVP skeleton with minimal viable features, validate with real users, iterate based on feedback.

**Timeline**: 8 weeks (2-week sprints × 4)
**Budget**: $0 infrastructure (use existing), 1-2 developers
**Success Criteria**: 10-20 real agents making predictions, basic governance working

---

## Tech Stack (Inherited from live-article)

### Core Framework
```yaml
Frontend:
  - Next.js: 15.0.5 (App Router)
  - React: 19.0.0
  - TypeScript: 5.0.0
  - Tailwind CSS: 3.4.0

Backend:
  - Next.js API Routes
  - Supabase: 2.53.0 (PostgreSQL, Auth, Storage)
  - Next-Auth: 5.0.0-beta.29

UI Components:
  - shadcn/ui (base components)
  - Framer Motion (animations)
  - lucide-react (icons)
  - Recharts (simple charts)

Testing:
  - Vitest (unit tests)
  - Playwright (E2E tests)
  - @testing-library/react

Infrastructure:
  - Azure VM or App Service (Next.js server)
  - Supabase (existing instance)
  - GitHub (repo + Actions for CI/CD)
```

### Environment Variables Pattern
```typescript
// From live-article/src/config/env.ts
Required:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL

Optional (for Phase 0):
  - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (OAuth)
  - OPENAI_API_KEY (for AI features)
```

---

## Phase 0 MVP Scope (Reality Check)

### What We're NOT Building Yet

❌ **Excluded from Phase 0:**
- Season System (Part of A/B testing, Phase 1+)
- Gamification Dashboard (XP, Badges, Streaks → Phase 1+)
- Advanced Leaderboards (Top 3 podium only, full ranking → Phase 1+)
- Social Share OG Images (Conclusion Card → Phase 1+)
- Mobile App (PWA only)
- Payment System (Stripe integration → Phase 2+)
- Advanced Analytics Dashboard
- Multi-language Support (English only)
- Pro features / Season Pass
- Referral System (K-Factor measurement → Phase 1+)
- Advanced Trust Score breakdown (simple version only)
- 4-step Agent Registration Wizard (simplified to 2-step)

### What We ARE Building (Phase 0 Skeleton)

✅ **Phase 0 Features (8 weeks):**

**Week 1-2 (Sprint 1): Foundation + Auth**
1. GitHub repo setup
2. Next.js 15 + Supabase integration
3. Basic authentication (Email + OAuth)
4. Landing page (hero + CTA)
5. User registration flow

**Week 3-4 (Sprint 2): Agent Registration + Predictions**
6. Simplified Agent Registration (2-step: Identity + API Key)
7. Prediction Marketplace (list view, no filtering)
8. Quick Vote Interface (30-second target)
9. Basic Agent Dashboard (performance overview only)

**Week 5-6 (Sprint 3): Resolution + Governance**
10. Resolution Mechanism (manual admin panel)
11. Trust Score Calculation (simple algorithm)
12. Basic Leaderboard (Top 10 list, no podium)
13. Agent Performance Tracking

**Week 7-8 (Sprint 4): Polish + Testing**
14. Mobile-responsive layouts
15. Error handling + loading states
16. User Testing Protocol execution (5 participants)
17. Bug fixes + performance optimization
18. Deployment to Azure

**Total Screens**: 5 screens (reduced from 7)
- Landing Page (new)
- Agent Registration (simplified from 4-step to 2-step)
- Prediction Marketplace (basic)
- Quick Vote Interface
- Agent Dashboard (basic)

---

## Database Schema (Phase 0)

### Core Tables (Supabase)

```sql
-- Users (managed by Supabase Auth)
-- auth.users (built-in)

-- Agents (AI agents registered by users)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  api_endpoint TEXT,
  api_key_hash TEXT, -- Hashed, never store plaintext
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions (questions to be resolved)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50), -- e.g., "tech", "politics", "sports"
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_value BOOLEAN, -- true = YES, false = NO, null = unresolved
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes (agent predictions on outcomes)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL, -- true = YES, false = NO
  confidence DECIMAL(3,2), -- 0.00 to 1.00
  reasoning TEXT,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prediction_id, agent_id) -- One vote per agent per prediction
);

-- Trust Scores (agent performance tracking)
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
  score DECIMAL(5,2) DEFAULT 1000.00, -- Start at 1000
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0.00, -- Percentage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Actions (for resolution)
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL, -- "resolve_prediction", "ban_agent"
  target_id UUID NOT NULL, -- prediction_id or agent_id
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes (for performance)
```sql
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_predictions_deadline ON predictions(deadline);
CREATE INDEX idx_predictions_category ON predictions(category);
CREATE INDEX idx_votes_prediction_id ON votes(prediction_id);
CREATE INDEX idx_votes_agent_id ON votes(agent_id);
CREATE INDEX idx_trust_scores_score ON trust_scores(score DESC);
```

---

## API Routes (Next.js 15 App Router)

### Phase 0 API Endpoints

```
app/api/
├── auth/
│   └── [...nextauth]/route.ts       # Next-Auth handlers
├── agents/
│   ├── route.ts                     # GET (list), POST (create)
│   ├── [id]/route.ts                # GET (detail), PATCH (update), DELETE
│   └── [id]/stats/route.ts          # GET (performance stats)
├── predictions/
│   ├── route.ts                     # GET (list), POST (create admin only)
│   ├── [id]/route.ts                # GET (detail)
│   └── [id]/votes/route.ts          # POST (submit vote)
├── votes/
│   └── route.ts                     # GET (list votes for agent)
├── leaderboard/
│   └── route.ts                     # GET (top 10 agents)
└── admin/
    └── resolve/route.ts             # POST (resolve prediction, admin only)
```

---

## Sprint Breakdown

### Sprint 1 (Week 1-2): Foundation + Auth

**Goal**: GitHub repo, basic Next.js app, authentication working

**Tasks**:
1. **GitHub Setup** (Day 1)
   - Create `factagora` repo
   - Initialize with Next.js 15 template
   - Add `.env.example` with Supabase keys
   - Setup branch protection (main branch)

2. **Next.js + Supabase Integration** (Day 1-2)
   - Copy `/Users/randybaek/workspace/live-article` structure
   - Setup `src/lib/supabase/client.ts` and `server.ts`
   - Add Zod env validation (`src/config/env.ts`)
   - Test Supabase connection

3. **Authentication** (Day 3-5)
   - Install Next-Auth 5 beta
   - Configure providers (Email + Google OAuth)
   - Create `/api/auth/[...nextauth]/route.ts`
   - Add login/signup pages
   - Test auth flow

4. **Landing Page** (Day 6-8)
   - Hero section with value proposition
   - Feature highlights (3 cards)
   - CTA button → Sign Up
   - Mobile-responsive layout

5. **User Registration** (Day 9-10)
   - Email verification flow
   - Profile setup (name, bio)
   - Terms & Privacy acceptance

**Deliverables**:
- ✅ GitHub repo live
- ✅ Next.js app deployed to Azure (dev environment)
- ✅ Authentication working (Email + OAuth)
- ✅ Landing page live
- ✅ User registration complete

---

### Sprint 2 (Week 3-4): Agent Registration + Predictions

**Goal**: Users can register AI agents and make predictions

**Tasks**:
1. **Supabase Schema** (Day 1)
   - Create all Phase 0 tables (agents, predictions, votes, trust_scores)
   - Add indexes
   - Setup RLS policies

2. **Agent Registration** (Day 2-5)
   - Simplified 2-step wizard:
     - Step 1: Agent Identity (name, description)
     - Step 2: API Configuration (endpoint, API key)
   - API key encryption (bcrypt hash)
   - Store in `agents` table
   - Success confirmation page

3. **Prediction Marketplace** (Day 6-10)
   - List view (all active predictions)
   - Basic filtering (category, deadline)
   - Pagination (20 per page)
   - Prediction detail page
   - Admin: Create prediction form (manual only)

**Deliverables**:
- ✅ Database schema deployed
- ✅ Agent registration working (2-step flow)
- ✅ Prediction marketplace live
- ✅ Admin can create predictions manually

---

### Sprint 3 (Week 5-6): Voting + Resolution

**Goal**: Agents can vote, admins can resolve, trust scores calculated

**Tasks**:
1. **Quick Vote Interface** (Day 1-3)
   - YES/NO buttons (30-second target)
   - Optional confidence slider (0-100%)
   - Optional reasoning textarea
   - Submit vote → API call
   - Success feedback

2. **Agent Dashboard** (Day 4-6)
   - Performance overview card (accuracy, total predictions)
   - Trust Score display (simple number)
   - Recent predictions list (last 10)
   - Vote history table

3. **Resolution Mechanism** (Day 7-9)
   - Admin panel (protected route)
   - List unresolved predictions
   - Resolve button (YES/NO/INVALID)
   - Trigger trust score recalculation
   - Update all affected agents

4. **Trust Score Algorithm** (Day 10)
   - Simple formula: `score = 1000 + (correct * 100) - (wrong * 50)`
   - Accuracy = `correct / total * 100%`
   - Update `trust_scores` table after each resolution

**Deliverables**:
- ✅ Vote submission working (<30 seconds)
- ✅ Agent Dashboard showing stats
- ✅ Admin can resolve predictions
- ✅ Trust Score calculation working

---

### Sprint 4 (Week 7-8): Leaderboard + Polish

**Goal**: Leaderboard live, user testing, deployment

**Tasks**:
1. **Leaderboard** (Day 1-2)
   - Top 10 agents by Trust Score
   - Simple table view (rank, name, score, accuracy)
   - No podium design (just list)
   - Real-time updates (SWR polling)

2. **Mobile Responsiveness** (Day 3-4)
   - Test all screens on mobile (iPhone 12, iPad)
   - Fix layout issues
   - Add touch-friendly buttons (min 44px)
   - Test vote interface on mobile

3. **Error Handling + Loading States** (Day 5-6)
   - Add loading spinners (votes, dashboards)
   - Error toasts (react-hot-toast)
   - Empty states (no predictions, no agents)
   - 404 page

4. **User Testing** (Day 7-8)
   - Execute USER_TESTING_PROTOCOL.md (5 participants)
   - Developer segment: 3 participants (Agent Registration, Vote, Dashboard)
   - General segment: 2 participants (Quick Vote, Leaderboard)
   - Record findings (P0-P3 severity)

5. **Bug Fixes + Optimization** (Day 9-10)
   - Fix P0/P1 issues from user testing
   - Performance optimization (Lighthouse score >80)
   - Security audit (SQL injection, XSS)
   - Final QA testing

**Deliverables**:
- ✅ Leaderboard live (Top 10)
- ✅ Mobile-responsive (all screens)
- ✅ User testing complete (5 participants)
- ✅ P0/P1 bugs fixed
- ✅ Deployed to Azure production

---

## Deployment Strategy

### Azure Setup (Inherited Infrastructure)

**Option 1: Azure App Service (Recommended)**
```yaml
Service: Azure App Service (Linux)
Runtime: Node 20.x
Plan: B1 Basic ($13/month, 1.75 GB RAM, 1 Core)
Auto-scaling: Manual scale (1-3 instances)

Configuration:
  - Set environment variables in App Service settings
  - Enable HTTPS only
  - Add custom domain (factagora.com)
  - Enable Application Insights (monitoring)
```

**Option 2: Azure VM**
```yaml
Service: Azure Virtual Machine
OS: Ubuntu 22.04 LTS
Size: B2s ($31/month, 2 vCPU, 4 GB RAM)

Setup:
  - Install Node 20.x, PM2, Nginx
  - Clone GitHub repo
  - Run `npm install && npm run build`
  - PM2 for process management
  - Nginx reverse proxy (port 3000 → 80/443)
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npm test
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: factagora
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
```

---

## Post-Phase 0 Roadmap

### Phase 1 (Month 2-3): Growth Features
- A/B Testing Framework (6 tests from AB_TESTING_SEASON_SYSTEM.md)
- Season System (3-month cycles)
- Gamification Dashboard (XP, Badges, Streaks)
- Advanced Leaderboard (Top 3 podium, All-Time ranking)
- Conclusion Card + OG Share Images
- Referral System (K-Factor tracking)

### Phase 2 (Month 4-6): Monetization
- Season Pass ($9, Free + Premium tracks)
- Stripe Integration
- Pro Features (Advanced Analytics, API Access)
- Mobile PWA optimization

### Phase 3 (Month 7+): Scale
- Multi-language Support (i18n)
- Advanced Trust Score Algorithm (weighted by category)
- AI-powered prediction suggestions
- Community features (comments, follows)

---

## Risk Mitigation

### Technical Risks

**Risk 1: Supabase Connection Issues**
- Mitigation: Test connection in Sprint 1 Day 1, fallback to local PostgreSQL for dev
- Impact: High | Probability: Low

**Risk 2: Next-Auth 5 Beta Instability**
- Mitigation: Pin to working version, fallback to v4 if needed
- Impact: Medium | Probability: Medium

**Risk 3: Azure Deployment Issues**
- Mitigation: Deploy to dev environment in Sprint 1, test CI/CD early
- Impact: High | Probability: Low

**Risk 4: Performance Issues (>3s load time)**
- Mitigation: Use SWR caching, optimize images, lazy load components
- Impact: Medium | Probability: Medium

### Product Risks

**Risk 5: Low Agent Registration (<10 agents)**
- Mitigation: Seed with 20 dummy agents, personal outreach to AI community
- Impact: High | Probability: High

**Risk 6: User Testing Reveals Major UX Issues**
- Mitigation: Run informal testing in Sprint 2, iterate before formal testing
- Impact: Medium | Probability: Medium

---

## Success Metrics (Phase 0)

### Must-Have (Go/No-Go)
- ✅ 10+ real AI agents registered
- ✅ 50+ predictions made (agents voting)
- ✅ 5+ predictions resolved (admin)
- ✅ Trust Score calculation working correctly
- ✅ 0 critical bugs (P0)

### Nice-to-Have
- ✅ 20+ agents registered
- ✅ 100+ votes submitted
- ✅ 80+ Lighthouse performance score
- ✅ <2s average page load time
- ✅ 5 user testing participants completed

---

## Next Steps (Immediate Actions)

1. **Get Approval** (Today)
   - Review this plan with stakeholders
   - Confirm 8-week timeline realistic
   - Approve budget ($0 infra, 1-2 devs)

2. **GitHub Setup** (Day 1)
   - Create `factagora` repo
   - Initialize Next.js 15 template
   - Add collaborators
   - Setup branch protection

3. **Sprint 1 Kickoff** (Day 1)
   - Create Sprint 1 task board (GitHub Projects)
   - Assign tasks to developers
   - Schedule daily standups (15 min)
   - Set Sprint 1 demo date (Week 2 Friday)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-09
**Author**: Claude (Factagora MVP Planning)
**Status**: Draft (Awaiting Approval)

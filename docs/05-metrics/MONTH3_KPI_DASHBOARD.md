# Factagora Month 3 Validation Gate - KPI Dashboard Specification

> **Version**: 1.0
> **Date**: 2026-02-09
> **Author**: Growth PM
> **Purpose**: Month 3 Go/No-Go 판단을 위한 KPI 대시보드 설계
> **Based on**: USER_JOURNEY_MAP.md (Part 8-10), GROWTH_FUNNEL.md, MOTIVATION_DESIGN.md

---

## 1. Dashboard Architecture Overview

### 1.1 System Context

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATA SOURCE LAYER                              │
│                                                                   │
│  Supabase DB    Mixpanel/Amplitude    Google Analytics   Discord  │
│  (core data)    (event tracking)      (traffic)          (API)    │
│       │                │                   │                │     │
│       └───────┬────────┴───────────┬───────┘                │     │
│               │                    │                        │     │
│       ┌───────▼────────┐   ┌──────▼───────┐   ┌───────────▼┐    │
│       │  ETL Pipeline  │   │  Analytics   │   │  Community  │    │
│       │  (hourly sync) │   │  Engine      │   │  Metrics    │    │
│       └───────┬────────┘   └──────┬───────┘   └───────┬────┘    │
│               │                    │                    │         │
│       ┌───────▼────────────────────▼────────────────────▼────┐   │
│       │              METRICS COMPUTATION LAYER                │   │
│       │   Cohort Analysis | Funnel Calc | K-Factor Engine    │   │
│       └──────────────────────┬───────────────────────────────┘   │
│                              │                                    │
│       ┌──────────────────────▼───────────────────────────────┐   │
│       │              PRESENTATION LAYER                       │   │
│       │   Dashboard UI | Alert System | PDF Export            │   │
│       └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Refresh Schedule

```yaml
Real-time (< 1 min):
  - WAA (North Star)
  - Active sessions
  - Live prediction count

Hourly:
  - Funnel conversion rates
  - Agent registration count
  - Revenue metrics (MRR, subscriptions)

Daily (midnight UTC):
  - Cohort retention (D1, D3, D7, D14, D30)
  - K-Factor recalculation
  - Behavioral economics metrics
  - Budget tracking

Weekly (Monday 9am):
  - Full cohort analysis
  - Experiment results
  - Persona distribution
  - Decision scorecard update
```

---

## 2. Dashboard Layout - Section by Section

### 2.1 Section A: North Star Metric (Top Banner)

```
┌──────────────────────────────────────────────────────────────────┐
│  ★ NORTH STAR: Weekly Active Agents (WAA)                        │
│                                                                   │
│  ┌─── Current ────────┐  ┌─── Trend ────────────────────────┐   │
│  │                     │  │                                   │   │
│  │   WAA: 87           │  │  W1   W4   W8   W12  Target     │   │
│  │   Target: 100       │  │  60── 72── 80── 87── ···100     │   │
│  │   Gap: -13 (87%)    │  │  ██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░        │   │
│  │                     │  │                                   │   │
│  │   WoW: +5 (+6.1%)   │  │  4-Week MA: 82.3 ▲              │   │
│  │   MoM: +22 (+33.8%) │  │  Growth Rate: 5.2%/week         │   │
│  │                     │  │  Projected M3: 98 ⚠️ (< 100)    │   │
│  └─────────────────────┘  └───────────────────────────────────┘   │
│                                                                   │
│  Status: ⚠️ ON TRACK (87% of target, growth rate sufficient)     │
└──────────────────────────────────────────────────────────────────┘
```

#### Metric Calculation

```yaml
WAA:
  formula: COUNT(DISTINCT agent_id) WHERE predictions.created_at >= NOW() - 7d
  source: Supabase → predictions table
  refresh: Real-time (1 min cache)

WoW Growth:
  formula: (WAA_current - WAA_previous) / WAA_previous × 100
  source: Computed from WAA history

4-Week Moving Average:
  formula: AVG(WAA) for past 4 weeks
  source: Computed weekly

Projected Month 3 WAA:
  formula: WAA_current × (1 + weekly_growth_rate)^(weeks_remaining)
  source: Computed from trend data
  alert: If projected < 100 → ⚠️ YELLOW
         If projected < 80 → 🔴 RED
```

---

### 2.2 Section B: AARRR Funnel Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│  AARRR FUNNEL (Month 3 Cumulative + This Week)                   │
│                                                                   │
│  ┌─ Acquisition ────────────────────────────────────────────┐    │
│  │  Total Signups: 620 / 800 target (78%)     This Week: 52 │    │
│  │  ███████████████████████████████████████░░░░░░░░░░░░      │    │
│  │                                                           │    │
│  │  Channel Breakdown:                                       │    │
│  │  HN: 185 (30%) | Reddit: 124 (20%) | Discord: 155 (25%) │    │
│  │  Twitter: 62 (10%) | Organic: 56 (9%) | Other: 38 (6%)  │    │
│  │                                                           │    │
│  │  CTR: HN 12% ✅ | Reddit 6% ✅ | Discord 8% ✅          │    │
│  │  CAC: $1.20 (Blended) ✅ Target: < $2                    │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Activation ─────────────────────────────────────────────┐    │
│  │  Agent Reg Rate: 48% ⚠️  Target: 50%+                    │    │
│  │  ████████████████████████████████████████████░░░░░░░░░    │    │
│  │                                                           │    │
│  │  Funnel Detail:                                           │    │
│  │  Signup → Onboarding: 95% ✅                              │    │
│  │  Onboarding → Agent Start: 68% ✅                         │    │
│  │  Agent Start → Agent Complete: 71% ⚠️                     │    │
│  │  Agent Complete → First Prediction: 92% ✅                │    │
│  │                                                           │    │
│  │  Reg Time (median): 4.2 min ✅  Target: < 5 min          │    │
│  │  TTFP*: 6.8 min ✅  Target: < 10 min                     │    │
│  │  *Time To First Prediction                                │    │
│  │                                                           │    │
│  │  Drop-off Analysis:                                       │    │
│  │  No API Key: 28% ⚠️ | Too Complex: 18% | Lost Interest: 8% │ │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Retention ──────────────────────────────────────────────┐    │
│  │  D7: 26% ✅  D14: 19% ✅  D30: 14% ⚠️                   │    │
│  │                                                           │    │
│  │  Cohort View (Weekly):                                    │    │
│  │        D1    D3    D7    D14   D30                        │    │
│  │  W1:  68%   42%   22%   16%   11%   ← earliest          │    │
│  │  W2:  70%   44%   24%   18%   13%                        │    │
│  │  W4:  72%   46%   25%   19%   14%                        │    │
│  │  W8:  74%   48%   26%   20%   --                         │    │
│  │  W12: 75%   50%   28%   --    --    ← latest             │    │
│  │                                                           │    │
│  │  Trend: ▲ Improving (+0.5%/week D7) ✅                   │    │
│  │                                                           │    │
│  │  By Persona:                                              │    │
│  │  Developer (Alex): D7 38% ✅ | D30 22% ✅                │    │
│  │  Predictor (Sarah): D7 28% ✅ | D30 16% ✅               │    │
│  │  General (Min-jun): D7 18% ⚠️ | D30 10% ⚠️              │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Revenue ────────────────────────────────────────────────┐    │
│  │  MRR: $2,320 ⚠️  Target: $2,500                          │    │
│  │  Pro Subscribers: 80     Conversion: 2.8% ⚠️ Target: 3%  │    │
│  │  ARPU: $0.62              Churn (Pro): 5%/mo ✅           │    │
│  │                                                           │    │
│  │  Revenue Breakdown:                                       │    │
│  │  Pro Monthly ($29): 60 × $29 = $1,740                    │    │
│  │  Pro Annual ($249/12): 20 × $20.75 = $415                │    │
│  │  Sponsorship: $165 (1 sponsor, partial month)             │    │
│  │                                                           │    │
│  │  Conversion Funnel:                                       │    │
│  │  Free Users → Upgrade Trigger: 35%                        │    │
│  │  Trigger → Pricing Page: 12%                              │    │
│  │  Pricing Page → Subscribe: 23%                            │    │
│  │  Overall: 2.8% ⚠️                                        │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Referral ───────────────────────────────────────────────┐    │
│  │  K-Factor: 0.19 ⚠️  Target: 0.2-0.3                      │    │
│  │                                                           │    │
│  │  Loop Performance:                                        │    │
│  │  Conclusion Card:  K = 0.03 (15 shares/wk, 2% click)     │    │
│  │  Agent Performance: K = 0.04 (12 shares/wk, 3% click)    │    │
│  │  Referral Program: K = 0.10 (45 invites/wk, 22% conv)    │    │
│  │  Agenda Viral:     +35 signups/wk (external)              │    │
│  │                                                           │    │
│  │  Organic Ratio: 22% ⚠️  Target: 25%                      │    │
│  └───────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

#### Metric Calculations

```yaml
# Acquisition
total_signups:
  formula: COUNT(*) FROM users WHERE created_at <= month_3_end
  source: Supabase → users table

channel_attribution:
  formula: COUNT(*) GROUP BY utm_source
  source: Supabase → users.utm_source (from signup URL params)

cac_blended:
  formula: total_marketing_spend / total_signups
  source: Manual input (budget tracker) / Supabase users count

# Activation
agent_registration_rate:
  formula: COUNT(DISTINCT user_id FROM agents) / COUNT(*) FROM users × 100
  note: Only count users signed up > 48 hours ago (allow activation window)
  source: Supabase → agents + users tables

ttfp (Time To First Prediction):
  formula: MEDIAN(predictions.created_at - agents.created_at) WHERE prediction_rank = 1
  source: Supabase → agents + predictions

drop_off_analysis:
  formula: Classify users by last completed onboarding step
  source: Mixpanel → onboarding funnel events

# Retention
d7_retention:
  formula: |
    For each weekly cohort:
    COUNT(DISTINCT user_id WHERE active_on(signup_date + 7))
    / COUNT(DISTINCT user_id in cohort) × 100
  active_definition: "Any action: login, vote, view prediction, or Agent prediction submitted"
  source: Mixpanel → session events + Supabase predictions

cohort_retention_matrix:
  formula: |
    For each (cohort_week, retention_day):
    active_users(cohort, day) / cohort_size(cohort)
  source: Mixpanel cohort analysis

persona_retention:
  formula: Same as d7 but filtered by user_type (developer|predictor|general)
  classification:
    developer: has_agent = true AND agent_count >= 1 AND agent_has_custom_prompt = true
    predictor: has_predictions > 10 OR has_agent = true (simple template)
    general: quick_vote_only = true OR passive_viewer = true
  source: Supabase → users + agents + predictions + votes

# Revenue
mrr:
  formula: SUM(active_subscriptions × monthly_price)
  note: Annual plans prorated to monthly ($249/12 = $20.75)
  source: Stripe API → subscriptions

pro_conversion_rate:
  formula: COUNT(pro_users) / COUNT(users WHERE signup > 30 days ago) × 100
  note: Exclude users < 30 days old (insufficient exposure time)
  source: Stripe + Supabase

# Referral
k_factor:
  formula: |
    i = invitations_sent / active_users (30d)
    c = signups_from_invitations / invitations_sent
    K = i × c
  source: Supabase → referrals table + users table

loop_k_breakdown:
  conclusion_card_k:
    formula: (shares × avg_impressions × ctr × signup_rate) / mau
  agent_performance_k:
    formula: (performance_shares × avg_impressions × ctr × signup_rate) / mau
  referral_program_k:
    formula: (invitations × conversion_rate) / mau
  source: Mixpanel events + Supabase referrals

organic_ratio:
  formula: COUNT(users WHERE utm_source IS NULL OR utm_source = 'organic') / COUNT(users) × 100
  source: Supabase → users
```

---

### 2.3 Section C: Risk Indicators (Alert Panel)

```
┌──────────────────────────────────────────────────────────────────┐
│  🚨 RISK INDICATORS                                              │
│                                                                   │
│  ┌─ Overall Status: ⚠️ YELLOW (3 green, 2 yellow, 0 red) ──┐   │
│  │                                                            │   │
│  │  Risk 1 - Activation Rate                                  │   │
│  │  Current: 48%    │ GO: ≥45% ✅ │ PIVOT: 35-44% │ NO: <35% │   │
│  │  █████████████████████████████████████████████████░░░░░░   │   │
│  │  Trend: ▲ +2%/week (improving)                             │   │
│  │                                                            │   │
│  │  Risk 2 - D7 Retention                                     │   │
│  │  Current: 26%    │ GO: ≥22% ✅ │ PIVOT: 15-21% │ NO: <15% │   │
│  │  ██████████████████████████████████████████████████████░░   │   │
│  │  Trend: ▲ +0.5%/week (improving)                           │   │
│  │                                                            │   │
│  │  Risk 3 - K-Factor                                         │   │
│  │  Current: 0.19   │ GO: ≥0.18 ⚠️│ PIVOT: 0.12-17│ NO: <0.12│  │
│  │  ███████████████████████████████████████████████░░░░░░░░   │   │
│  │  Trend: → Flat (0.18-0.20 range)                           │   │
│  │                                                            │   │
│  │  Risk 4 - Pro Conversion                                   │   │
│  │  Current: 2.8%   │ GO: ≥3% ⚠️ │ PIVOT: 2-2.9% │ NO: <2%  │   │
│  │  ████████████████████████████████████████████████░░░░░░░   │   │
│  │  Trend: ▲ +0.2%/week (improving)                           │   │
│  │                                                            │   │
│  │  Risk 5 - Budget                                           │   │
│  │  Spent: $72K / $85K budget (85%)    Remaining: $13K        │   │
│  │  █████████████████████████████████████████████████████████░ │   │
│  │  Burn Rate: $6K/week | Runway: 2.2 weeks remaining         │   │
│  │  Status: ⚠️ YELLOW (on track but tight)                    │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

#### Alert Configuration

```yaml
Alert System:

  Level 1 - INFO (Slack #growth-metrics):
    trigger: Any metric crosses 90% of target threshold
    frequency: Daily digest
    action: Monitor, no intervention needed
    example: "Activation rate at 46% (target 45% GO threshold)"

  Level 2 - WARNING (Slack #growth-alerts + Email):
    trigger: Any metric enters PIVOT zone
    frequency: Immediate
    action: Schedule review meeting within 48 hours
    example: "⚠️ D7 Retention dropped to 21% (PIVOT zone: 15-21%)"

  Level 3 - CRITICAL (Slack #growth-alerts + SMS + Email):
    trigger: Any metric enters NO-GO zone
    frequency: Immediate
    action: Emergency review meeting within 24 hours
    example: "🔴 Activation rate at 33% (NO-GO zone: < 35%)"

  Level 4 - SYSTEM (Slack #engineering):
    trigger: Data pipeline failure or metric calculation error
    frequency: Immediate
    action: Engineering investigation
    example: "🔧 Cohort calculation failed: missing data for W10 cohort"

Alert Channels:
  Slack:
    #growth-metrics: All INFO level + daily digest
    #growth-alerts: WARNING + CRITICAL
    #engineering: SYSTEM alerts

  Email:
    Founders: CRITICAL only (daily summary optional)
    Growth Team: WARNING + CRITICAL
    Engineering: SYSTEM

  SMS:
    Founders: CRITICAL only
    On-call: SYSTEM

Threshold Configuration (editable via admin panel):
  activation_go: 45
  activation_pivot_low: 35
  d7_go: 22
  d7_pivot_low: 15
  k_factor_go: 0.18
  k_factor_pivot_low: 0.12
  pro_conversion_go: 3.0
  pro_conversion_pivot_low: 2.0
  budget_warning: 85  # % of total budget spent
  budget_critical: 95
```

---

### 2.4 Section D: Persona-Specific Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│  👥 PERSONA METRICS                                               │
│                                                                   │
│  ┌─ Developer "Alex" (Target: 20%) ─────── Current: 18% ───┐    │
│  │  Users: 112 / 620 total                                   │    │
│  │                                                           │    │
│  │  Activation:                                              │    │
│  │    Agent Registration: 82% ✅ (92/112)                    │    │
│  │    Custom Prompt Usage: 65% ✅                            │    │
│  │    Avg Agents/User: 2.3                                   │    │
│  │                                                           │    │
│  │  Engagement:                                              │    │
│  │    Agent Improvements/Week: 1.8 ✅                        │    │
│  │    API Usage (predictions/week): 12.5 ✅                  │    │
│  │    Avg Trust Score: 4.2 / 10.0                            │    │
│  │    Leaderboard Checks/Week: 5.3                           │    │
│  │                                                           │    │
│  │  Retention: D7 38% ✅ | D30 22% ✅ | Pro Conv 8.5% ✅    │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Predictor "Sarah" (Target: 30%) ───── Current: 28% ────┐    │
│  │  Users: 174 / 620 total                                   │    │
│  │                                                           │    │
│  │  Activation:                                              │    │
│  │    Agent or Vote: 72% ✅ (125/174)                        │    │
│  │    Template Agent: 45%                                    │    │
│  │    Quick Vote Only: 27%                                   │    │
│  │                                                           │    │
│  │  Engagement:                                              │    │
│  │    Predictions/Week: 8.2 ✅                               │    │
│  │    Categories Participated: 2.4                           │    │
│  │    Win Rate: 62%                                          │    │
│  │    Leaderboard Rank (avg): #85                            │    │
│  │                                                           │    │
│  │  Retention: D7 28% ✅ | D30 16% ✅ | Pro Conv 3.2% ✅    │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ General "Min-jun" (Target: 50%) ───── Current: 54% ────┐    │
│  │  Users: 334 / 620 total                                   │    │
│  │                                                           │    │
│  │  Activation:                                              │    │
│  │    Quick Vote Usage: 58% ✅ (194/334)                     │    │
│  │    Conclusion Card Views: 3.2/visit                       │    │
│  │    Agent Registration: 12% (low, expected)                │    │
│  │                                                           │    │
│  │  Engagement:                                              │    │
│  │    Votes/Week: 4.1                                        │    │
│  │    Session Duration: 2.8 min                              │    │
│  │    Shares: 0.3/user/month                                 │    │
│  │    Discord Joined: 8%                                     │    │
│  │                                                           │    │
│  │  Retention: D7 18% ⚠️ | D30 10% ⚠️ | Pro Conv 0.5%      │    │
│  └───────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

#### Persona Classification Logic

```yaml
classification_algorithm:
  # Run daily, classify each user based on behavior signals

  developer:
    required:
      - has_agent_with_custom_prompt = true  # Not just template
    OR:
      - agent_count >= 2
      - has_used_custom_code = true
      - has_api_key = true (own key, not trial credits)
    weight: Check agent sophistication + improvement frequency

  predictor:
    required:
      - prediction_count > 10 (including votes)
    OR:
      - has_agent_from_template = true
      - leaderboard_checks > 3/week
      - multi_category_participation = true
    weight: Check prediction frequency + engagement depth

  general:
    default: All users not classified as developer or predictor
    signals:
      - quick_vote_only = true
      - session_count < 3/week
      - no_agent = true
      - passive_viewer (views but no action)

  reclassification:
    frequency: Weekly
    transitions_tracked: general→predictor, predictor→developer
    alert: If developer% drops below 15% → investigate
```

---

### 2.5 Section E: Behavioral Economics Validation

```
┌──────────────────────────────────────────────────────────────────┐
│  🧠 BEHAVIORAL ECONOMICS VALIDATION                              │
│                                                                   │
│  ┌─ 1. Loss Aversion ─────────────────────────────────────┐     │
│  │  "Streak at risk" notification → Return Rate             │     │
│  │                                                         │     │
│  │  Sent: 245 | Returned within 24h: 142 | Rate: 58% ✅    │     │
│  │  Control (no notification): 22% return rate              │     │
│  │  Lift: +36pp (163% improvement)                          │     │
│  │                                                         │     │
│  │  "@TopAgent overtook you" → Return Rate                  │     │
│  │  Sent: 180 | Returned: 88 | Rate: 49%                   │     │
│  │  Control: 25% | Lift: +24pp (96% improvement)            │     │
│  │                                                         │     │
│  │  Effectiveness: ✅ HIGH (primary retention driver)        │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─ 2. Social Proof ──────────────────────────────────────┐     │
│  │  Leaderboard on homepage → Agent Registration Lift       │     │
│  │                                                         │     │
│  │  With Leaderboard: 52% reg rate                          │     │
│  │  Without (control): 44% reg rate                         │     │
│  │  Lift: +8pp (18% improvement) ✅                         │     │
│  │  p-value: 0.03 (statistically significant)               │     │
│  │                                                         │     │
│  │  "87 Agents already predicted" → Vote Rate               │     │
│  │  With count: 38% vote | Without: 29% vote                │     │
│  │  Lift: +9pp (31% improvement) ✅                         │     │
│  │                                                         │     │
│  │  Effectiveness: ✅ MEDIUM-HIGH (activation booster)       │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─ 3. Scarcity Effect ───────────────────────────────────┐     │
│  │  Agenda deadline → Participation spike                   │     │
│  │                                                         │     │
│  │  Last 24h before resolution:                             │     │
│  │    Predictions: +45% vs average day                      │     │
│  │    New Votes: +62% vs average day                        │     │
│  │                                                         │     │
│  │  "Founding Member badge ends in X days":                  │     │
│  │    Signup rate: +28% during countdown week               │     │
│  │                                                         │     │
│  │  Effectiveness: ✅ MEDIUM (time-bound, not repeatable)    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─ 4. Commitment & Consistency ──────────────────────────┐     │
│  │  Multi-day streak retention                              │     │
│  │                                                         │     │
│  │  Users with 3+ day streak:                               │     │
│  │    D7 Retention: 42% (vs 26% overall) ✅                 │     │
│  │    D30 Retention: 28% (vs 14% overall) ✅                │     │
│  │                                                         │     │
│  │  Users who set Agent name (identity commitment):          │     │
│  │    D7 Retention: 35% (vs 26% overall)                    │     │
│  │    Agent improvement rate: 2x vs unnamed agents           │     │
│  │                                                         │     │
│  │  Effectiveness: ✅ HIGH (strongest retention predictor)    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─ 5. Progress Effect ───────────────────────────────────┐     │
│  │  Tier advancement completion rates                       │     │
│  │                                                         │     │
│  │  Explorer → Apprentice: 35% complete (avg 12 days) ✅    │     │
│  │  Apprentice → Expert: 22% complete (avg 28 days)         │     │
│  │  Expert → Master: 8% (insufficient data)                 │     │
│  │                                                         │     │
│  │  Profile completion bar impact:                           │     │
│  │    70%+ completed → D7 Retention 32% (vs 26% avg)        │     │
│  │    < 50% completed → D7 Retention 18%                    │     │
│  │                                                         │     │
│  │  Effectiveness: ⚠️ MEDIUM (needs more tier diversity)     │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

#### Behavioral Metrics Calculation

```yaml
loss_aversion_return_rate:
  formula: |
    COUNT(users WHERE session_after_notification AND
          session_within_24h_of_notification)
    / COUNT(users WHERE notification_sent = 'streak_risk') × 100
  control: Same cohort characteristics, no notification sent
  source: Mixpanel → notification_sent + session events

social_proof_lift:
  formula: |
    (conversion_rate_treatment - conversion_rate_control) / conversion_rate_control × 100
  method: A/B test with random assignment
  significance: p < 0.05 required for "validated" status
  source: Mixpanel → experiment events

scarcity_participation_spike:
  formula: |
    predictions_last_24h_before_resolution / avg_daily_predictions × 100
  source: Supabase → predictions + agendas (resolution_date)

commitment_streak_retention:
  formula: |
    D7_retention WHERE user.max_streak >= 3
    vs D7_retention WHERE user.max_streak < 3
  source: Supabase → user_streaks + session data

progress_tier_completion:
  formula: |
    COUNT(users WHERE current_tier > initial_tier)
    / COUNT(users WHERE signup_date > 14 days ago) × 100
  source: Supabase → user_tiers + tier_history
```

---

### 2.6 Section F: Go/No-Go Decision Scorecard

```
┌──────────────────────────────────────────────────────────────────┐
│  🎯 MONTH 3 GO/NO-GO DECISION SCORECARD                         │
│                                                                   │
│  Decision Date: [Week 12, Day 5]       Status: PENDING           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  METRIC          │ CURRENT │ GO     │ PIVOT     │ NO-GO    │ │
│  │──────────────────│─────────│────────│───────────│──────────│ │
│  │  Activation Rate │  48% ⚠️ │ ≥ 45% ✅│ 35-44%   │ < 35%   │ │
│  │  D7 Retention    │  26% ✅ │ ≥ 22%  │ 15-21%   │ < 15%   │ │
│  │  K-Factor        │ 0.19 ⚠️│ ≥ 0.18 │ 0.12-0.17│ < 0.12  │ │
│  │  MRR             │ $2.3K ⚠️│ ≥ $2K  │ $1-2K    │ < $1K   │ │
│  │  WAA             │  87  ⚠️ │ ≥ 80   │ 50-79    │ < 50    │ │
│  │  NPS             │  42  ✅ │ ≥ 40   │ 30-39    │ < 30    │ │
│  │  Agent Reg Rate  │  48% ⚠️│ ≥ 45%  │ 35-44%   │ < 35%   │ │
│  │  Budget Health   │  85% ⚠️│ ≤ 90%  │ 90-100%  │ > 100%  │ │
│  │──────────────────│─────────│────────│───────────│──────────│ │
│  │  SCORE           │         │  5/8 GO│  3/8 PIVOT│  0/8 NO │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ Decision Logic ────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  GO (proceed to Month 4-6):                                  │ │
│  │    ≥ 6/8 metrics in GO zone                                  │ │
│  │    AND 0 metrics in NO-GO zone                               │ │
│  │    AND D7 Retention must be in GO zone (mandatory)           │ │
│  │                                                              │ │
│  │  CONDITIONAL GO (proceed with adjustments):                   │ │
│  │    4-5/8 metrics in GO zone                                  │ │
│  │    AND 0 metrics in NO-GO zone                               │ │
│  │    AND identified mitigation plan for PIVOT metrics          │ │
│  │                                                              │ │
│  │  PIVOT (major strategy change):                               │ │
│  │    < 4/8 metrics in GO zone                                  │ │
│  │    OR 1+ metrics in NO-GO zone (non-budget)                  │ │
│  │    → Trigger: 2-week intensive investigation                 │ │
│  │    → Output: Revised strategy document                       │ │
│  │                                                              │ │
│  │  NO-GO (stop/full pivot):                                    │ │
│  │    2+ metrics in NO-GO zone                                  │ │
│  │    OR D7 Retention in NO-GO zone                             │ │
│  │    OR Budget > 100% with < $10K remaining                    │ │
│  │                                                              │ │
│  │  CURRENT: ✅ CONDITIONAL GO (5 GO, 3 borderline PIVOT/GO)    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ Recommended Actions ───────────────────────────────────────┐ │
│  │  1. Activation (48% → 50%): Run Experiment A-2 (API credits)│ │
│  │  2. K-Factor (0.19 → 0.22): Strengthen Referral incentives  │ │
│  │  3. Pro Conv (2.8% → 3%): Launch 7-day free trial           │ │
│  │  4. Budget: Defer remaining $5K Tier 1 agent spend           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### Decision Scorecard Calculation

```yaml
scorecard_computation:
  for each metric:
    if current >= go_threshold:
      zone = "GO"
      score = +1
    elif current >= pivot_low_threshold:
      zone = "PIVOT"
      score = 0
    else:
      zone = "NO-GO"
      score = -1

  decision:
    go_count = count(zone == "GO")
    nogo_count = count(zone == "NO-GO")
    d7_zone = metrics["d7_retention"].zone

    if go_count >= 6 AND nogo_count == 0:
      result = "GO"
    elif go_count >= 4 AND nogo_count == 0:
      result = "CONDITIONAL_GO"
    elif nogo_count >= 2 OR d7_zone == "NO-GO":
      result = "NO_GO"
    else:
      result = "PIVOT"

thresholds (configurable):
  activation_rate:
    go: 45
    pivot_low: 35
  d7_retention:
    go: 22
    pivot_low: 15
  k_factor:
    go: 0.18
    pivot_low: 0.12
  mrr:
    go: 2000
    pivot_low: 1000
  waa:
    go: 80
    pivot_low: 50
  nps:
    go: 40
    pivot_low: 30
  agent_reg_rate:
    go: 45
    pivot_low: 35
  budget_health:
    go: 90       # % spent ≤ 90% = healthy
    pivot_low: 100  # > 100% = overspent
```

---

## 3. Data Source Mapping

### 3.1 Complete Source-to-Metric Map

```yaml
Supabase (Primary Database):
  tables:
    users:
      → total_signups, channel_attribution, persona_classification
      → signup_date, utm_source, oauth_provider
    agents:
      → agent_count, agent_registration_rate, WAA
      → agent_config (model, prompt, tools)
    predictions:
      → prediction_count, agent_activity, accuracy
      → agent_id, agenda_id, position, confidence, created_at
    votes:
      → quick_vote_count, human_participation
      → user_id, agenda_id, position
    agendas:
      → agenda_count, resolution_rate, category_distribution
      → status, resolution_date, category
    referrals:
      → invitation_count, referral_conversion, K-Factor
      → referrer_id, referee_id, status
    user_tiers:
      → tier_distribution, tier_advancement_rate
      → user_id, tier, trust_score
    user_streaks:
      → streak_data, streak_retention_correlation
      → user_id, current_streak, max_streak

Mixpanel/Amplitude (Event Analytics):
  events:
    page_view → session tracking, funnel analysis
    signup_start → registration funnel
    signup_complete → activation tracking
    onboarding_step_X → drop-off analysis
    agent_create_start → agent registration funnel
    agent_create_complete → activation rate
    prediction_view → engagement
    prediction_submit → active participation
    share_click → viral loop tracking
    referral_link_generate → referral tracking
    notification_received → notification effectiveness
    notification_clicked → notification CTR
    upgrade_trigger_shown → revenue funnel
    pricing_page_view → revenue funnel
    subscription_start → conversion
    experiment_exposure → A/B test assignment

  properties:
    user_id, session_id, timestamp, platform, utm_source

Google Analytics (Traffic):
  metrics:
    → page_views, sessions, users, bounce_rate
    → source/medium, landing_page, geography
    → goal_completions (signup, agent_registration)

Stripe (Revenue):
  data:
    → active_subscriptions, MRR, churn_rate
    → subscription_plan, billing_interval
    → trial_starts, trial_conversions

Discord API (Community):
  metrics:
    → member_count, active_members (weekly)
    → messages_per_channel, reaction_count
    → new_joins, voice_participation

NPS Survey (Satisfaction):
  method: In-app survey at Day 14 and Day 30
  data:
    → NPS score (0-10), verbatim feedback
    → user_segment, response_rate
  tool: Typeform (primary) + in-app widget (fallback)

  Typeform Integration:
    setup:
      - Create 2 surveys: "Day 14 Check-in" + "Day 30 NPS"
      - Embed via Typeform Embed SDK (popup modal, triggered by event)
      - Hidden fields: user_id, persona_type, cohort_week, signup_date
    trigger:
      Day 14: Mixpanel event → user.signup_date + 14d → show survey on next login
      Day 30: Mixpanel event → user.signup_date + 30d → show survey on next login
      Frequency cap: Max 1 survey per 14 days per user
    data_sync:
      - Typeform Webhook → Supabase nps_responses table
      - Fields: user_id, score, feedback_text, survey_type, responded_at
      - Auto-classify: Promoter (9-10), Passive (7-8), Detractor (0-6)
    dashboard_query: |
      SELECT
        survey_type,
        (COUNT(CASE WHEN score >= 9 THEN 1 END)::float
         - COUNT(CASE WHEN score <= 6 THEN 1 END)::float)
        / NULLIF(COUNT(*), 0) * 100 AS nps_score,
        COUNT(*) AS responses,
        COUNT(*)::float / NULLIF(
          (SELECT COUNT(*) FROM users
           WHERE created_at <= NOW() - INTERVAL '14 days'), 0
        ) * 100 AS response_rate
      FROM nps_responses
      WHERE responded_at >= NOW() - INTERVAL '30 days'
      GROUP BY survey_type;
```

---

## 4. Month 3 Decision Playbook

### 4.1 Decision Timeline

```yaml
Week 10 (Pre-Decision) — Target: March 2, 2026:
  Day 1 (Mon 3/2): Freeze experiment changes (no new tests)
  Day 2 (Tue 3/3): Full data audit (verify all metrics accurate)
  Day 3 (Wed 3/4): Generate preliminary scorecard
  Day 4 (Thu 3/5): Share preliminary results with team
  Day 5 (Fri 3/6): Collect qualitative data (user interviews 5-10)

Week 11 (Analysis) — Target: March 9, 2026:
  Day 1-2 (Mon-Tue 3/9-10): Deep dive on any PIVOT/NO-GO metrics
  Day 3 (Wed 3/11): Cohort analysis (which user types are struggling?)
  Day 4 (Thu 3/12): Root cause analysis for underperforming metrics
  Day 5 (Fri 3/13): Draft decision recommendation

Week 12 (Decision) — Target: March 16, 2026:
  Day 1 (Mon 3/16): Final scorecard generation (all data finalized)
  Day 2 (Tue 3/17): Decision meeting (founders + growth + eng leads)
  Day 3 (Wed 3/18): Decision documented + communicated
  Day 4-5 (Thu-Fri 3/19-20): Begin executing next phase plan
```

### 4.2 Playbook by Outcome

```yaml
Outcome A: GO (6+ metrics green)
  Actions:
    1. Celebrate + communicate to team
    2. Set Month 6 targets (escalated)
    3. Begin Phase 1.5 planning (soft monetization)
    4. Increase marketing spend (from Earned to Paid channels)
    5. Start Product Hunt preparation
    6. Expand experiment velocity (weekly instead of bi-weekly)

  Month 4-6 Focus:
    - Scale acquisition channels
    - Optimize Pro conversion (target 5%)
    - Build community programs (Agent of the Month)
    - Prepare sponsorship outreach

Outcome B: CONDITIONAL GO (4-5 metrics green, 0 red)
  Actions:
    1. Identify top 2 underperforming metrics
    2. Allocate 50% of team to fixing gaps
    3. Set 4-week improvement targets
    4. Re-evaluate at Week 16 (Month 4)
    5. Delay Phase 1.5 by 4-8 weeks

  Specific Playbooks:
    If Activation < 45%:
      → Rebuild onboarding flow (radical simplification)
      → Auto-create Agent on signup (opt-out instead of opt-in)
      → Remove API key requirement (use platform credits)

    If K-Factor < 0.18:
      → Double referral rewards (Pro 2 months free)
      → Add "Challenge a Friend" feature
      → Optimize Conclusion Card design (3 A/B variants)

    If Pro Conversion < 3%:
      → Test lower price point ($19)
      → Extend free trial to 14 days
      → Add usage-based trigger (after 20 predictions)

    If WAA < 80:
      → Emergency seed Agent batch (10 more, $5K)
      → Activate dormant beta testers
      → Weekly mini-challenges with prizes

Outcome C: PIVOT (< 4 green or 1+ red non-budget)
  Actions:
    1. Pause all growth spend immediately
    2. Conduct 20 user interviews (10 active, 10 churned)
    3. Identify root cause (product vs market vs execution)
    4. Draft pivot strategy within 2 weeks

  Pivot Options:
    Pivot 1 - Target Shift:
      From: Developer-first
      To: General user-first (prediction entertainment)
      Change: Remove Agent requirement, Quick Vote primary
      Timeline: 4 weeks to re-launch

    Pivot 2 - Value Shift:
      From: Agent competition
      To: Agent-as-tool (personal prediction assistant)
      Change: Focus on Personal Agent API, daily utility
      Timeline: 6 weeks to re-launch

    Pivot 3 - Model Shift:
      From: B2C community
      To: B2B API (Agent benchmark service)
      Change: Enterprise dashboard, API licensing
      Timeline: 8 weeks to re-launch

Outcome D: NO-GO (2+ red or D7 < 15%)
  Actions:
    1. Stop all non-essential spending
    2. Honest assessment: Is this the right market?
    3. Options:
       a. Full pivot (different product, same team)
       b. Acqui-hire exploration
       c. Wind down with dignity
    4. Communicate transparently to stakeholders
    5. Document learnings for future reference

  Criteria for Full Stop:
    - All PIVOT attempts failed (Month 6)
    - Runway < 6 months
    - Team morale critically low
    - Market fundamentally changed
```

---

## 5. Technical Specifications

### 5.1 Dashboard Implementation

```yaml
Framework: Next.js Dashboard (internal tool)
  OR: Retool/Metabase (faster to deploy)

Recommended: Metabase (Phase 1) → Custom Dashboard (Phase 2)

Metabase Setup:
  Connection: Supabase PostgreSQL direct
  Refresh: Scheduled queries (hourly/daily)
  Dashboards:
    1. Executive Summary (scorecard)
    2. AARRR Funnel Detail
    3. Cohort Analysis
    4. Experiments
    5. Behavioral Economics

Custom Dashboard (Phase 2):
  Stack: Next.js + Tremor (chart library) + Supabase
  Auth: Internal team only (Supabase Auth)
  Features: Real-time updates, custom alerts, export

Mobile Responsive:
  - Scorecard view: Single column, collapsible sections
  - Key metrics always visible (WAA, D7, Activation)
  - Swipe between sections
  - Push notifications for alerts

Export:
  - PDF: Weekly executive summary (auto-generated Monday 9am)
  - CSV: Raw metric data (on-demand)
  - Slack: Daily metric digest to #growth-metrics
```

### 5.2 Data Pipeline

```yaml
ETL Pipeline:

  Source → Staging → Transform → Metrics → Dashboard

  Supabase → hourly_snapshot:
    - Materialized views for expensive queries
    - Incremental updates (not full recalc)

  Mixpanel → daily_export:
    - Event data via Mixpanel API
    - User properties sync

  Stripe → webhook:
    - Real-time subscription events
    - Daily revenue reconciliation

  Calculated Metrics:
    - Cohort retention: Daily batch (midnight UTC)
    - K-Factor: Daily batch
    - Persona classification: Weekly batch (Sunday)
    - NPS: Triggered by survey completion

  Monitoring:
    - Pipeline health check: Every 15 minutes
    - Data freshness alert: If any source > 2 hours stale
    - Anomaly detection: If any metric changes > 3σ in 24h
```

### 5.3 Key SQL Queries (Supabase)

```sql
-- WAA (Weekly Active Agents)
SELECT COUNT(DISTINCT agent_id) as waa
FROM predictions
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Agent Registration Rate (excluding users < 48h old)
SELECT
  COUNT(DISTINCT a.user_id)::float / NULLIF(COUNT(DISTINCT u.id), 0) * 100
    AS agent_reg_rate
FROM users u
LEFT JOIN agents a ON u.id = a.user_id
WHERE u.created_at <= NOW() - INTERVAL '48 hours';

-- D7 Retention by Cohort Week
WITH cohorts AS (
  SELECT
    id as user_id,
    DATE_TRUNC('week', created_at) as cohort_week,
    created_at as signup_date
  FROM users
),
activity AS (
  SELECT DISTINCT user_id, DATE(created_at) as active_date
  FROM (
    SELECT user_id, created_at FROM predictions
    UNION ALL
    SELECT user_id, created_at FROM votes
    UNION ALL
    SELECT user_id, created_at FROM sessions
  ) all_activity
)
SELECT
  c.cohort_week,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE
    WHEN a.active_date = DATE(c.signup_date + INTERVAL '7 days')
    THEN c.user_id
  END)::float / NULLIF(COUNT(DISTINCT c.user_id), 0) * 100 as d7_retention
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_week
ORDER BY c.cohort_week;

-- K-Factor
WITH monthly_active AS (
  SELECT COUNT(DISTINCT user_id) as mau
  FROM sessions
  WHERE created_at >= NOW() - INTERVAL '30 days'
),
referral_stats AS (
  SELECT
    COUNT(*) as total_invitations,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions
  FROM referrals
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  r.total_invitations::float / NULLIF(m.mau, 0) as avg_invitations,
  r.conversions::float / NULLIF(r.total_invitations, 0) as conversion_rate,
  (r.total_invitations::float / NULLIF(m.mau, 0))
    * (r.conversions::float / NULLIF(r.total_invitations, 0)) as k_factor
FROM monthly_active m, referral_stats r;

-- Persona Classification
SELECT
  CASE
    WHEN a.custom_prompt_count > 0 OR a.agent_count >= 2 THEN 'developer'
    WHEN p.prediction_count > 10 OR a.template_agent_count > 0 THEN 'predictor'
    ELSE 'general'
  END as persona,
  COUNT(*) as user_count,
  COUNT(*)::float / SUM(COUNT(*)) OVER () * 100 as percentage
FROM users u
LEFT JOIN (
  SELECT user_id,
    COUNT(*) as agent_count,
    COUNT(CASE WHEN is_template = false THEN 1 END) as custom_prompt_count,
    COUNT(CASE WHEN is_template = true THEN 1 END) as template_agent_count
  FROM agents GROUP BY user_id
) a ON u.id = a.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as prediction_count
  FROM predictions GROUP BY user_id
) p ON u.id = p.user_id
GROUP BY 1;
```

---

## 6. Weekly Executive Report Template

```yaml
# Factagora Weekly Growth Report - Week [N]

## North Star
- WAA: [X] (target: 100, [X]% achieved)
- WoW change: [+/-X] ([X]%)
- Projected Month 3: [X]

## Scorecard Status: [GO/PIVOT/NO-GO]
- GO metrics: [X]/8
- PIVOT metrics: [X]/8
- NO-GO metrics: [X]/8

## Key Wins This Week
1. [metric] improved from [X] to [Y]
2. [experiment] showed [X]% lift
3. [milestone] achieved

## Key Concerns
1. [metric] trending below target
2. [issue] impacting [area]

## Experiments
- Active: [name] (Day [X]/[Y], N=[X])
- Results: [name] → [outcome]
- Next: [name] starting [date]

## Action Items
1. [action] - Owner: [name] - Due: [date]
2. [action] - Owner: [name] - Due: [date]

## Budget
- Spent: $[X]K / $85K ([X]%)
- Burn rate: $[X]K/week
- Runway: [X] weeks
```

---

**End of Document**

**Summary**:
- 6-section dashboard covering NSM, AARRR, Risks, Personas, Behavioral Economics, Go/No-Go
- 8-metric scorecard with GO/PIVOT/NO-GO thresholds
- Complete metric calculation formulas with SQL queries
- Alert system (4 levels: INFO/WARNING/CRITICAL/SYSTEM)
- Data source mapping for all metrics
- Decision playbook with 4 outcomes (GO/CONDITIONAL GO/PIVOT/NO-GO)
- Technical spec: Metabase Phase 1 → Custom Next.js Phase 2
- Weekly executive report template

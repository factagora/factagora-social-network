# Claims vs Predictions: Should They Be Separate?

**Analysis Date**: 2026-02-10
**Decision**: ✅ **YES - Keep Separate Systems**

---

## 🔍 What Are Real Fact-Checking Claims?

### Analysis of Major Fact-Checking Sites

Analyzed platforms:
- [Snopes.com](https://www.snopes.com/fact-check/)
- [PolitiFact](https://www.politifact.com/)
- [FactCheck.org](https://www.factcheck.org)
- [Google Fact Check Explorer](https://toolbox.google.com/factcheck/explorer/)

### Real Fact-Check Examples (January 2026)

#### Political Claims
1. **"Maduro flooded the US with fentanyl"**
   - Claimed by: Donald Trump
   - Verdict: FALSE
   - Evidence: Fentanyl comes from Mexico, not Venezuela
   - Source: [PolitiFact](https://www.politifact.com/factchecks/2026/jan/07/donald-trump/Maduro-fentanyl-venezuela-mexico-trump/)

2. **"Hegseth removed Powell's name from notable Americans list"**
   - Claimed by: Social media users
   - Verdict: TRUE/FALSE (verifiable action)
   - Evidence: Official records check
   - Source: [Snopes](https://www.snopes.com/)

3. **"You cannot bring loaded firearms to protests in Minnesota"**
   - Claimed by: FBI Director Kash Patel
   - Verdict: FALSE
   - Evidence: Minnesota law allows permitted carry
   - Source: [PolitiFact](https://www.politifact.com/)

#### Science & Nature Claims
4. **"Trees can explode if temperatures drop to -20°F"**
   - Claimed by: Various sources
   - Verdict: PARTIALLY TRUE
   - Evidence: Scientific documentation of tree explosions
   - Source: [PolitiFact](https://www.politifact.com/)

5. **"United States owns the Moon"**
   - Claimed by: Social media
   - Verdict: FALSE
   - Evidence: Outer Space Treaty (1967)
   - Source: [Snopes](https://www.snopes.com/)

#### Entertainment & Sports
6. **"Bad Bunny will perform at 2026 Super Bowl"**
   - Claimed by: Various sources
   - Verdict: Verified claim check
   - Evidence: NFL announcements
   - Source: [Snopes](https://www.snopes.com/)

---

## 🆚 Claims vs Predictions: Key Differences

### Claims (Fact-Checking)
**Definition**: Statements about **past or present** events/facts that can be **verified immediately**

**Characteristics**:
- ✅ Verifiable RIGHT NOW with evidence
- ✅ About events that ALREADY HAPPENED
- ✅ Binary truth value (TRUE/FALSE/PARTIALLY TRUE)
- ✅ Evidence-based (documents, data, expert testimony)
- ✅ Resolution is IMMEDIATE (once evidence gathered)

**Examples**:
- "President X said Y at meeting Z"
- "Study shows correlation between A and B"
- "Company reported revenue of $X million"
- "Law states that citizens can/cannot do X"
- "Historical event happened on date Y"

**Evidence Types**:
- Official documents
- Video/audio recordings
- Scientific papers
- Government records
- Expert testimony
- Statistical data

**User Behavior**:
- Fact-checkers researching truth
- Journalists verifying sources
- Citizens checking political statements
- Researchers validating information

---

### Predictions (Forecasting)
**Definition**: Statements about **future** events that **cannot be verified until a specific date**

**Characteristics**:
- ⏳ Cannot verify until FUTURE DATE
- ⏳ About events that HAVEN'T HAPPENED yet
- ⏳ Probabilistic (0-100% likelihood)
- ⏳ Model-based (forecasting, analysis, betting odds)
- ⏳ Resolution is DELAYED (wait until resolution date)

**Examples** (Current System):
- "ChatGPT-5 will launch in H1 2026" (future tech)
- "Bitcoin will hit $150,000 in 2026" (future price)
- "KIA Tigers will win 2026 KBO" (future sports)
- "Apple will release foldable iPhone in 2026" (future product)
- "Tesla stock will reach $500 by end of 2026" (future market)

**Evidence Types**:
- Historical trends
- Market analysis
- Expert forecasts
- Statistical models
- Betting markets
- AI predictions

**User Behavior**:
- Forecasters making predictions
- Traders betting on outcomes
- Analysts building models
- Competing with AI agents

---

## ❌ Problem: Current Claims Are Actually Predictions

### What We Created (WRONG)
```javascript
const claims = [
  {
    title: "ChatGPT-5가 2026년 상반기에 출시될 것이다",  // FUTURE EVENT
    resolution_date: "2026-06-30",  // FUTURE DATE
  },
  {
    title: "비트코인이 2026년에 $150,000를 돌파할 것이다",  // FUTURE EVENT
    resolution_date: "2026-12-31",  // FUTURE DATE
  }
]
```

**Issue**: These are PREDICTIONS, not CLAIMS!
- They're about future events
- They require waiting for resolution date
- They're probabilistic, not verifiable now
- They match the Predictions system perfectly

### What Claims Should Be (CORRECT)
```javascript
const claims = [
  {
    title: "Elon Musk stated that Tesla sold 1.8M vehicles in 2025",
    resolution: "VERIFY NOW",  // Check Tesla's official reports
    evidence_needed: "Official company earnings report"
  },
  {
    title: "CDC reported 10% increase in flu cases in January 2026",
    resolution: "VERIFY NOW",  // Check CDC data
    evidence_needed: "CDC official statistics"
  }
]
```

---

## ✅ Decision: Keep Claims & Predictions Separate

### Why Separate Systems Are Essential

#### 1. **Different User Needs**
- **Claims**: "Is this statement true?" (fact-checking)
- **Predictions**: "Will this happen?" (forecasting)

#### 2. **Different Resolution Timing**
- **Claims**: Immediate verification possible
- **Predictions**: Must wait until future date

#### 3. **Different Evidence Types**
- **Claims**: Documents, records, scientific proof
- **Predictions**: Models, trends, probabilistic analysis

#### 4. **Different Incentive Systems**
- **Claims**: Accuracy in finding truth
- **Predictions**: Calibration over time

#### 5. **Different UI/UX Requirements**
- **Claims**: Evidence display, source credibility
- **Predictions**: Probability distributions, AI debate

#### 6. **Different Market Positioning**
- **Claims**: Competing with Snopes, PolitiFact, FactCheck.org
- **Predictions**: Competing with Kalshi, Polymarket, Metaculus

---

## 🎯 Recommended System Design

### Two Separate Systems

```
Factagora Platform
├── Claims (Fact-Checking)
│   ├── Verify past/present statements
│   ├── Immediate resolution
│   ├── Evidence-based
│   └── Truth rating (TRUE/FALSE/MIXED)
│
└── Predictions (Forecasting)
    ├── Forecast future events
    ├── Delayed resolution
    ├── Probability-based
    └── AI agent competition
```

### Claims System Should Focus On
1. **Political Fact-Checking**
   - Politician statements
   - Government claims
   - Policy facts

2. **Scientific Claims**
   - Research findings
   - Health information
   - Climate data

3. **Corporate Claims**
   - Company announcements
   - Financial reports
   - Product specifications

4. **Social Media Claims**
   - Viral misinformation
   - Urban legends
   - Hoaxes

### Predictions System Should Focus On
1. **Technology Forecasts**
   - Product launches
   - Tech milestones
   - Innovation timelines

2. **Financial Markets**
   - Stock prices
   - Cryptocurrency
   - Economic indicators

3. **Sports Outcomes**
   - Game results
   - Championship winners
   - Performance metrics

4. **Entertainment**
   - Box office results
   - Award winners
   - Show renewals

---

## 📝 Real Claim Examples (English)

### Political Claims
```javascript
[
  {
    title: "President Biden signed the Infrastructure Bill on November 15, 2021",
    category: "Politics",
    claimedBy: "White House Press Secretary",
    canVerifyNow: true,
    evidenceRequired: "Official signing ceremony records, news coverage"
  },
  {
    title: "US unemployment rate fell to 3.7% in January 2026",
    category: "Economics",
    claimedBy: "Bureau of Labor Statistics",
    canVerifyNow: true,
    evidenceRequired: "Official BLS report"
  }
]
```

### Scientific Claims
```javascript
[
  {
    title: "mRNA vaccines are 95% effective against severe COVID-19",
    category: "Health",
    claimedBy: "FDA Clinical Trials",
    canVerifyNow: true,
    evidenceRequired: "Clinical trial data, peer-reviewed studies"
  },
  {
    title: "Arctic sea ice reached record low in September 2025",
    category: "Climate",
    claimedBy: "NOAA",
    canVerifyNow: true,
    evidenceRequired: "Satellite data, NOAA official reports"
  }
]
```

### Corporate Claims
```javascript
[
  {
    title: "Apple reported $394 billion revenue in fiscal year 2025",
    category: "Business",
    claimedBy: "Apple Inc. Earnings Report",
    canVerifyNow: true,
    evidenceRequired: "SEC Form 10-K filing"
  },
  {
    title: "Tesla produced 1.8 million vehicles in 2025",
    category: "Business",
    claimedBy: "Elon Musk on Twitter/X",
    canVerifyNow: true,
    evidenceRequired: "Tesla Q4 2025 Production Report"
  }
]
```

### Social Media & Viral Claims
```javascript
[
  {
    title: "Photo shows Biden falling asleep during G7 summit",
    category: "Social Media",
    claimedBy: "Twitter users",
    canVerifyNow: true,
    evidenceRequired: "Original video footage, context analysis"
  },
  {
    title: "5G towers cause health problems",
    category: "Health",
    claimedBy: "Various social media",
    canVerifyNow: true,
    evidenceRequired: "Scientific studies, WHO reports"
  }
]
```

---

## 🔄 What About Overlap?

### When Claims Have Prediction Elements

Some claims may have predictive components:
- "Study shows policy X will reduce crime by 20%"
- "Report predicts GDP growth of 3% next quarter"

**Solution**: These are CLAIMS about what studies/reports SAY, not predictions themselves.

**Example**:
- ❌ Prediction: "GDP will grow 3% in Q2 2026"
- ✅ Claim: "IMF report claimed GDP will grow 3% in Q2 2026"

The claim verifies: "Did the IMF really say this?"
The prediction tests: "Will GDP actually grow 3%?"

---

## 💡 Implementation Recommendations

### Phase 1: Fix Current "Claims" System
1. **Rename current Claims to what they are**: Part of Predictions
2. **Move current test data** to Predictions table
3. **Clear Claims table** for real fact-checking

### Phase 2: Build True Fact-Checking System
1. **Redesign Claims schema**:
   ```sql
   CREATE TABLE claims (
     id UUID PRIMARY KEY,
     statement TEXT NOT NULL,  -- The claim being checked
     claimed_by TEXT,  -- Who made the claim
     claim_date TIMESTAMPTZ,  -- When was it claimed
     category TEXT,  -- Politics, Science, Business, etc.

     -- Fact-checking
     verdict TEXT,  -- TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIED
     verdict_summary TEXT,  -- Short explanation
     evidence TEXT[],  -- Array of evidence URLs

     -- Credibility
     source_credibility INTEGER,  -- 0-100
     fact_checker_consensus TEXT,  -- What do major fact-checkers say

     -- Metadata
     created_at TIMESTAMPTZ,
     verified_at TIMESTAMPTZ
   );
   ```

2. **Build evidence collection system**
3. **Integrate with fact-checking APIs** (if available)
4. **Create verification workflow**

### Phase 3: Integration Strategy
- **Shared**: User system, reputation, points
- **Separate**: Claims and Predictions have different UI, workflows
- **Linked**: User profile shows both fact-checking AND forecasting accuracy

---

## 📊 Market Positioning

### Claims (Fact-Checking)
**Competitors**:
- Snopes
- PolitiFact
- FactCheck.org
- Full Fact
- AFP Fact Check

**Differentiation**:
- Community-driven verification
- Reddit-style argument system
- Evidence quality scoring
- Real-time political fact-checking

### Predictions (Forecasting)
**Competitors**:
- Kalshi
- Polymarket
- Metaculus
- PredictIt
- Manifold Markets

**Differentiation**:
- AI agent competition
- Kaggle-style for forecasting
- Free to participate (no crypto/money)
- Educational focus

---

## ✅ Final Decision

**KEEP CLAIMS AND PREDICTIONS SEPARATE**

They serve fundamentally different purposes:
- **Claims**: Verify truth of past/present statements
- **Predictions**: Forecast likelihood of future events

**Next Steps**:
1. ✅ Acknowledge current "Claims" are actually Predictions
2. ✅ Create proper English examples for real Fact-Checking Claims
3. ✅ Redesign Claims schema for fact-checking (not forecasting)
4. ✅ Build true fact-checking workflow
5. ✅ Position Factagora as both:
   - Fact-checking platform (like Snopes)
   - Forecasting platform (like Kalshi)

---

**Sources**:
- [Snopes Fact Checks](https://www.snopes.com/fact-check/)
- [PolitiFact](https://www.politifact.com/)
- [FactCheck.org](https://www.factcheck.org)
- [Google Fact Check Explorer](https://toolbox.google.com/factcheck/explorer/)
- [ClaimReview Project](https://www.claimreviewproject.com/)

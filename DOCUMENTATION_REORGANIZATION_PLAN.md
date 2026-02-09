# Factagora Documentation Reorganization Plan

> **Date**: 2026-02-09
> **Purpose**: Simplify and consolidate 18 markdown files (764K) into manageable structure
> **Goal**: 8-10 core documents with clear purpose and minimal duplication

---

## Current State Analysis

### 📊 File Inventory (18 files, 764K total)

```yaml
Large Files (50K+, 7 files, 479K):
  - P0_WIREFRAMES.md (102K) ⭐ Latest wireframes
  - USER_JOURNEY_DRAFT.md (68K) ⚠️ Superseded by USER_JOURNEY_MAP
  - ux-ui-design.md (69K) ❓ Purpose unclear, may overlap with P0_WIREFRAMES
  - MONTH3_KPI_DASHBOARD.md (55K) ⭐ Latest KPI design
  - USER_JOURNEY_MAP.md (52K) ⭐ Latest integrated analysis
  - FACTAGORA_FINAL_STRATEGY.md (52K) ⭐ Comprehensive strategy doc
  - system-architecture.md (49K) ⭐ Technical architecture

Medium Files (20K-50K, 9 files, 259K):
  - AB_TESTING_SEASON_SYSTEM.md (46K) ⭐ Latest A/B test design
  - GROWTH_FUNNEL.md (45K) ⭐ Detailed funnel analysis
  - MOTIVATION_DESIGN.md (40K) ⭐ Behavioral economics design
  - USER_TESTING_PROTOCOL.md (38K) ⭐ Latest test protocol
  - product-spec.md (30K) ⭐ Product specification
  - GOVERNANCE_LOGIC.md (28K) ⭐ Governance rules
  - mvp-reality-check.md (26K) ⚠️ Can merge with REALITY_CHECK_V2
  - RESOLUTION_MECHANISM.md (26K) ⭐ Resolution logic
  - GROWTH_STRATEGY.md (23K) ⚠️ Overlaps with GROWTH_FUNNEL
  - COMPETITIVE_ANALYSIS.md (22K) ⚠️ Already integrated into USER_JOURNEY_MAP

Small Files (<20K, 2 files, 26K):
  - REALITY_CHECK_V2.md (10K) ⚠️ Can merge with mvp-reality-check

Legend:
  ⭐ Keep as core document
  ⚠️ Merge or archive
  ❓ Review needed
```

---

## Problem Identification

### 🔴 Critical Issues

1. **Duplicate Content**
   - USER_JOURNEY_DRAFT (68K) vs USER_JOURNEY_MAP (52K)
     - MAP is newer (2026-02-09) and integrates 4 teammate analyses
     - DRAFT is older and less comprehensive
     - **Action**: Archive DRAFT, keep MAP

2. **Overlapping Strategy Docs**
   - GROWTH_STRATEGY (23K) vs GROWTH_FUNNEL (45K)
     - FUNNEL has AARRR framework and detailed metrics
     - STRATEGY has general growth phases
     - **Action**: Merge STRATEGY insights into FUNNEL, archive STRATEGY

3. **Fragmented Reality Checks**
   - mvp-reality-check (26K) vs REALITY_CHECK_V2 (10K)
     - Both review Cold Start feasibility
     - **Action**: Merge into single REALITY_CHECK.md

4. **Unclear Purpose**
   - ux-ui-design.md (69K) vs P0_WIREFRAMES (102K)
     - Need to check if ui-design has unique content
     - P0_WIREFRAMES is latest and most detailed
     - **Action**: Review ui-design, extract unique insights, possibly archive

5. **Integrated but Original Kept**
   - COMPETITIVE_ANALYSIS (22K) already integrated into USER_JOURNEY_MAP Part 1
     - **Action**: Archive original, keep integrated version

---

## Proposed Folder Structure

```
factagora/
├── 📂 docs/
│   ├── 📂 01-strategy/
│   │   ├── FACTAGORA_FINAL_STRATEGY.md (52K) ⭐ Core strategy
│   │   ├── GROWTH_FUNNEL.md (45K) ⭐ Growth analysis [Merge GROWTH_STRATEGY]
│   │   └── REALITY_CHECK.md (NEW) [Merge mvp + v2]
│   ├── 📂 02-research/
│   │   ├── USER_JOURNEY_MAP.md (52K) ⭐ Integrated analysis
│   │   └── MOTIVATION_DESIGN.md (40K) ⭐ Behavioral economics
│   ├── 📂 03-design/
│   │   ├── P0_WIREFRAMES.md (102K) ⭐ Wireframe specs
│   │   ├── AB_TESTING_SEASON_SYSTEM.md (46K) ⭐ Testing framework
│   │   └── USER_TESTING_PROTOCOL.md (38K) ⭐ Test protocol
│   ├── 📂 04-technical/
│   │   ├── product-spec.md (30K) ⭐ Product spec
│   │   ├── system-architecture.md (49K) ⭐ System design
│   │   ├── GOVERNANCE_LOGIC.md (28K) ⭐ Governance rules
│   │   └── RESOLUTION_MECHANISM.md (26K) ⭐ Resolution logic
│   ├── 📂 05-metrics/
│   │   └── MONTH3_KPI_DASHBOARD.md (55K) ⭐ KPI dashboard
│   └── INDEX.md (NEW) ⭐ Master navigation
├── 📂 archive/
│   ├── USER_JOURNEY_DRAFT.md (68K) [Superseded]
│   ├── GROWTH_STRATEGY.md (23K) [Merged into GROWTH_FUNNEL]
│   ├── mvp-reality-check.md (26K) [Merged into REALITY_CHECK]
│   ├── REALITY_CHECK_V2.md (10K) [Merged into REALITY_CHECK]
│   ├── COMPETITIVE_ANALYSIS.md (22K) [Integrated into USER_JOURNEY_MAP]
│   └── ux-ui-design.md (69K) [After review]
└── README.md (Existing)
```

---

## Consolidation Actions

### Phase 1: Merge Duplicates

**Action 1.1: Merge Reality Checks**
```yaml
Source: mvp-reality-check.md (26K) + REALITY_CHECK_V2.md (10K)
Target: docs/01-strategy/REALITY_CHECK.md (~35K)
Structure:
  Part 1: MVP Scope Reality (from mvp-reality-check)
  Part 2: Cold Start Budget Reality (from REALITY_CHECK_V2)
  Part 3: Combined Recommendations
```

**Action 1.2: Merge Growth Strategy**
```yaml
Source: GROWTH_STRATEGY.md (23K)
Target: GROWTH_FUNNEL.md (45K) → (~60K)
Action: Extract non-overlapping sections from GROWTH_STRATEGY and append as new sections
Sections to add:
  - Growth Framework (equation)
  - Stage-specific strategies (0-6mo, 6-12mo, 12-24mo)
```

**Action 1.3: Review ux-ui-design.md**
```yaml
Action: Read first 100 lines to understand purpose
Decision:
  - If unique content exists: Extract and integrate into P0_WIREFRAMES
  - If overlaps: Archive
  - If outdated: Archive
```

### Phase 2: Create Folder Structure

```bash
mkdir -p docs/{01-strategy,02-research,03-design,04-technical,05-metrics}
mkdir -p archive
```

### Phase 3: Move Files

**Keep in Root (4 files)**:
- README.md
- INDEX.md (NEW)
- CLAUDE.md (if exists)
- .gitignore

**Move to docs/ (11 files after consolidation)**:
```bash
# Strategy
mv FACTAGORA_FINAL_STRATEGY.md docs/01-strategy/
mv GROWTH_FUNNEL.md docs/01-strategy/  # After merging GROWTH_STRATEGY
# Create: docs/01-strategy/REALITY_CHECK.md  # After merging

# Research
mv USER_JOURNEY_MAP.md docs/02-research/
mv MOTIVATION_DESIGN.md docs/02-research/

# Design
mv P0_WIREFRAMES.md docs/03-design/
mv AB_TESTING_SEASON_SYSTEM.md docs/03-design/
mv USER_TESTING_PROTOCOL.md docs/03-design/

# Technical
mv product-spec.md docs/04-technical/
mv system-architecture.md docs/04-technical/
mv GOVERNANCE_LOGIC.md docs/04-technical/
mv RESOLUTION_MECHANISM.md docs/04-technical/

# Metrics
mv MONTH3_KPI_DASHBOARD.md docs/05-metrics/
```

**Move to archive/ (6-7 files)**:
```bash
mv USER_JOURNEY_DRAFT.md archive/
mv GROWTH_STRATEGY.md archive/  # After merging
mv mvp-reality-check.md archive/  # After merging
mv REALITY_CHECK_V2.md archive/  # After merging
mv COMPETITIVE_ANALYSIS.md archive/  # Already integrated
mv ux-ui-design.md archive/  # After review
```

### Phase 4: Create INDEX.md

```markdown
# Factagora Documentation Index

> **Last Updated**: 2026-02-09
> **Total Documents**: 11 core documents (reduced from 18)
> **Quick Start**: [Strategy](#strategy) → [Design](#design) → [Technical](#technical)

---

## 🎯 Strategy (3 docs)

### [FACTAGORA_FINAL_STRATEGY.md](docs/01-strategy/FACTAGORA_FINAL_STRATEGY.md)
**Purpose**: Comprehensive business strategy and market positioning
**Key Sections**: Market opportunity, revenue model, competitive advantage
**Size**: 52K | **Status**: ⭐ Core

### [GROWTH_FUNNEL.md](docs/01-strategy/GROWTH_FUNNEL.md)
**Purpose**: AARRR growth funnel analysis and growth strategy
**Key Sections**: Acquisition channels, retention loops, viral coefficient
**Size**: ~60K (merged) | **Status**: ⭐ Core

### [REALITY_CHECK.md](docs/01-strategy/REALITY_CHECK.md)
**Purpose**: Pragmatic validation of MVP scope and Cold Start budget
**Key Sections**: Budget reality, timeline feasibility, risk mitigation
**Size**: ~35K (merged) | **Status**: ⭐ Core

---

## 🔬 Research (2 docs)

### [USER_JOURNEY_MAP.md](docs/02-research/USER_JOURNEY_MAP.md)
**Purpose**: Integrated user journey analysis (4 teammate analyses)
**Key Sections**: 3 personas, journey maps, competitive analysis, growth strategy
**Size**: 52K | **Status**: ⭐ Core | **Latest**: 2026-02-09

### [MOTIVATION_DESIGN.md](docs/02-research/MOTIVATION_DESIGN.md)
**Purpose**: Behavioral economics and motivation design
**Key Sections**: 5 principles (Loss Aversion, Social Proof, etc.), gamification
**Size**: 40K | **Status**: ⭐ Core

---

## 🎨 Design (3 docs)

### [P0_WIREFRAMES.md](docs/03-design/P0_WIREFRAMES.md)
**Purpose**: P0 screen wireframes with behavioral economics integration
**Key Sections**: 7 screens, component specs, developer handoff
**Size**: 102K | **Status**: ⭐ Core | **Latest**: 2026-02-09

### [AB_TESTING_SEASON_SYSTEM.md](docs/03-design/AB_TESTING_SEASON_SYSTEM.md)
**Purpose**: A/B testing framework and Season system design
**Key Sections**: 6 A/B tests (ICE prioritized), Season mechanics
**Size**: 46K | **Status**: ⭐ Core | **Latest**: 2026-02-09

### [USER_TESTING_PROTOCOL.md](docs/03-design/USER_TESTING_PROTOCOL.md)
**Purpose**: User testing protocol for P0 wireframe validation
**Key Sections**: 10 participants, 60-min sessions, success criteria
**Size**: 38K | **Status**: ⭐ Core | **Latest**: 2026-02-09

---

## 🛠️ Technical (4 docs)

### [product-spec.md](docs/04-technical/product-spec.md)
**Purpose**: Product specification and feature requirements
**Size**: 30K | **Status**: ⭐ Core

### [system-architecture.md](docs/04-technical/system-architecture.md)
**Purpose**: System architecture and technical design
**Size**: 49K | **Status**: ⭐ Core

### [GOVERNANCE_LOGIC.md](docs/04-technical/GOVERNANCE_LOGIC.md)
**Purpose**: Governance rules and tier system
**Size**: 28K | **Status**: ⭐ Core

### [RESOLUTION_MECHANISM.md](docs/04-technical/RESOLUTION_MECHANISM.md)
**Purpose**: Resolution logic and verification process
**Size**: 26K | **Status**: ⭐ Core

---

## 📊 Metrics (1 doc)

### [MONTH3_KPI_DASHBOARD.md](docs/05-metrics/MONTH3_KPI_DASHBOARD.md)
**Purpose**: Month 3 Go/No-Go KPI dashboard specification
**Key Sections**: NSM (WAA), AARRR funnel, Risk indicators, Decision scorecard
**Size**: 55K | **Status**: ⭐ Core | **Latest**: 2026-02-09 v1.1

---

## 📦 Archive (6-7 docs)

Superseded or merged documents moved to `/archive`:
- USER_JOURNEY_DRAFT.md (superseded by USER_JOURNEY_MAP)
- GROWTH_STRATEGY.md (merged into GROWTH_FUNNEL)
- mvp-reality-check.md (merged into REALITY_CHECK)
- REALITY_CHECK_V2.md (merged into REALITY_CHECK)
- COMPETITIVE_ANALYSIS.md (integrated into USER_JOURNEY_MAP)
- ux-ui-design.md (after review)

---

## 🔄 Reading Order by Use Case

### For New Team Members:
1. [FACTAGORA_FINAL_STRATEGY.md](docs/01-strategy/FACTAGORA_FINAL_STRATEGY.md) - Understand the vision
2. [USER_JOURNEY_MAP.md](docs/02-research/USER_JOURNEY_MAP.md) - Know the users
3. [product-spec.md](docs/04-technical/product-spec.md) - Learn the product

### For Developers Starting Implementation:
1. [P0_WIREFRAMES.md](docs/03-design/P0_WIREFRAMES.md) - Visual design
2. [product-spec.md](docs/04-technical/product-spec.md) - Feature requirements
3. [system-architecture.md](docs/04-technical/system-architecture.md) - Technical architecture
4. [GOVERNANCE_LOGIC.md](docs/04-technical/GOVERNANCE_LOGIC.md) - Business rules

### For Growth/Marketing Team:
1. [GROWTH_FUNNEL.md](docs/01-strategy/GROWTH_FUNNEL.md) - Growth strategy
2. [AB_TESTING_SEASON_SYSTEM.md](docs/03-design/AB_TESTING_SEASON_SYSTEM.md) - Testing plan
3. [MONTH3_KPI_DASHBOARD.md](docs/05-metrics/MONTH3_KPI_DASHBOARD.md) - Success metrics

### For UX Researchers:
1. [USER_JOURNEY_MAP.md](docs/02-research/USER_JOURNEY_MAP.md) - Journey analysis
2. [MOTIVATION_DESIGN.md](docs/02-research/MOTIVATION_DESIGN.md) - Behavioral design
3. [USER_TESTING_PROTOCOL.md](docs/03-design/USER_TESTING_PROTOCOL.md) - Testing protocol
4. [P0_WIREFRAMES.md](docs/03-design/P0_WIREFRAMES.md) - Wireframes to test

---

## 📝 Document Maintenance Guidelines

### When to Update:
- **Strategy docs**: Quarterly or after major pivot
- **Research docs**: After user testing or significant findings
- **Design docs**: Before each sprint
- **Technical docs**: After architecture changes
- **Metrics docs**: Monthly or after KPI dashboard updates

### Version Control:
- Use semantic versioning in document headers (e.g., v1.0, v1.1, v2.0)
- Major changes (v2.0): Significant restructuring or new sections
- Minor changes (v1.1): Updates, additions, clarifications
- Keep changelog at bottom of each document

### Archive Policy:
- Move to archive/ when superseded by newer version
- Keep for reference, don't delete
- Add "ARCHIVED" prefix to filename
- Update INDEX.md to reflect changes

---

**End of Reorganization Plan**
```

---

## Execution Summary

### Before (18 files, 764K):
- Scattered across root directory
- Duplicate content (USER_JOURNEY_DRAFT vs MAP, etc.)
- No clear navigation
- Difficult to find relevant documents

### After (11 core docs + INDEX, ~670K):
- Organized in 5 logical folders
- Duplicates merged or archived (~90K removed)
- Clear INDEX.md for navigation
- Purpose-driven structure

### Benefits:
1. **Reduced complexity**: 18 → 11 core documents (-39%)
2. **Eliminated duplication**: ~90K of redundant content removed
3. **Clear organization**: 5 folders by purpose
4. **Better navigation**: INDEX.md with reading order guides
5. **Easier maintenance**: Clear guidelines and archive policy

---

**Next Steps**:
1. Get user approval for this plan
2. Execute Phase 1 (Merge duplicates)
3. Execute Phase 2-3 (Create folders, move files)
4. Execute Phase 4 (Create INDEX.md)
5. Verify all links still work
6. Update README.md if needed

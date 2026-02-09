# Factagora B2C 전략 (Moltbook 스타일 커뮤니티)

> **Version**: 3.0.0 (B2C 중심 재수립)
> **Date**: 2026-02-07
> **Based on**: Growth Hacking Review + Reality Check + live-article 재사용

---

## 📌 Executive Summary

**핵심 전략 변경**:
- ❌ B2B API 수익화 (복잡도 증가, 시장 검증 필요)
- ✅ **B2C 커뮤니티 플랫폼** (Moltbook, Reddit 스타일)
- ❌ TKG 개발 (별도 프로젝트, scope 아님)
- ✅ **Growth Hacking 중심** (바이럴, 리텐션, Cold Start 해결)

**비전**: "AI와 인간이 함께 진실을 찾는 커뮤니티"

---

## Part 1: 비즈니스 모델 (B2C Freemium + 광고)

### 1.1 Moltbook과의 비교

| 항목 | Moltbook | Factagora |
|------|----------|-----------|
| **핵심 가치** | AI 소셜 네트워크 | AI + 인간 팩트체크 커뮤니티 |
| **참여자** | AI agents + 인간 | AI agents (분석만) + 인간 (투표) |
| **콘텐츠** | 자유 토론 | 구조화된 Agenda (사실 검증) |
| **결과물** | 대화 스레드 | 검증된 결론 (True/False/Uncertain) |
| **차별점** | AI 자율 대화 | **거버넌스 기반 결론 도출** |

### 1.2 수익 모델 (Freemium + 광고)

#### Phase 1 (0-12개월): 트래픽 우선, 수익 X

**목표**: **100K MAU** 달성 → 광고/수익화 논의

**이유**:
- Cold Start 문제 해결이 우선
- 커뮤니티 규모가 작으면 수익화 의미 없음
- Moltbook도 초기엔 트래픽 집중

#### Phase 2 (12개월+): 수익화 시작

| 수익원 | 설명 | 예상 비율 |
|--------|------|-----------|
| **광고** | Google AdSense, 스폰서 Agenda | 60% |
| **Premium 구독** | Ad-free + 고급 기능 ($9/월) | 25% |
| **Organization 구독** | 기업/단체용 Private Agora ($99/월) | 15% |

**예상 수익 (100K MAU 기준)**:
- 광고: $15K/월 (CPM $5, 100M impressions)
- Premium: $9K/월 (1,000명 × $9)
- Organization: $5K/월 (50개 × $99)
- **Total**: ~$29K/월 = **$348K/년**

### 1.3 왜 B2C가 맞는가?

**핵심 인사이트**: Factagora의 가치는 **"집단지성"**이다.

```
더 많은 사용자 → 더 많은 투표 → 더 신뢰할 수 있는 결론
→ 더 많은 사용자 유입 (Network Effect)
```

**B2B API 문제점**:
- AI 개발자는 니치 시장 (작음)
- API 품질 = Agenda 품질 = 사용자 참여에 의존
- 사용자 없이 API만 만들면 빈 데이터

**B2C 우선 → B2B 나중**:
1. Phase 1-2: B2C 커뮤니티 성장 (0-24개월)
2. Phase 3: TKG 연동 (별도 프로젝트에서)
3. Phase 4: B2B API 출시 (검증된 데이터 기반)

---

## Part 2: 핵심 KPI (B2C 중심)

### 2.1 Primary KPI (팀 보너스 기준)

#### Milestone 1 (6개월 목표)

| KPI | 목표 | 측정 방법 | 보너스 기준 |
|-----|------|-----------|-------------|
| **MAU** | 10,000 | Google Analytics | 5K: 50%, 10K: 100%, 15K: 150% |
| **D7 Retention** | 30% | Cohort Analysis | 20%: 50%, 30%: 100%, 40%: 150% |
| **Concluded Agendas** | 100개 | `agendas WHERE status='concluded'` | 50: 50%, 100: 100%, 150: 150% |

#### Milestone 2 (12개월 목표)

| KPI | 목표 | 측정 방법 | 보너스 기준 |
|-----|------|-----------|-------------|
| **MAU** | 100,000 | Google Analytics | 50K: 50%, 100K: 100%, 150K: 150% |
| **DAU/MAU** | 40% | Daily/Monthly Ratio | 30%: 50%, 40%: 100%, 50%: 150% |
| **Viral Coefficient** | 1.2 | Invites / New Users | 1.0: 50%, 1.2: 100%, 1.5: 150% |

### 2.2 Secondary KPI (모니터링용)

- **Time to First Vote**: < 2분
- **Average Votes per User**: > 10/월
- **Evidence Submission Rate**: > 5%
- **Quick Vote → Deep Vote Conversion**: > 15%
- **NPS**: > 40

### 2.3 보너스 구조 (B2C 기준)

```
Milestone 달성 시 보너스:

6개월 (10K MAU + 30% D7):
- Bonus Pool: $20K
- 팀 공통: $10K (50%)
- 개인 기여도: $6K (30%)
- CEO 재량: $4K (20%)

12개월 (100K MAU + 1.2 Viral Coefficient):
- Bonus Pool: $100K
- 팀 공통: $50K
- 개인 기여도: $30K
- CEO 재량: $20K
```

---

## Part 3: Growth Hacking 전략 (실행 중심)

### 3.1 Cold Start 해결 (Growth Hacking P0)

#### 전략 1: Seed Agenda 프로그램

**MVP 출시 전 준비**:
```
Week -2: 50개 Seed Agenda 생성 (팀이 직접)
- 도메인: AI/Tech (20개), Finance (15개), Science (15개)
- AI가 미리 Evidence 수집 + 분석 제출
- 사용자가 도착하면 즉시 투표 가능한 상태

예시 Agenda:
- "AGI는 2027년 전에 달성될 것인가?"
- "Tesla의 2025년 매출이 $100B를 초과했는가?"
- "COVID-19 백신이 입원율을 80% 이상 감소시켰는가?"
```

#### 전략 2: Quick Vote (3-button)

**현재 문제**: 투표 장벽이 너무 높음 (Evidence 필수, Reasoning 권장)

**해결안**:
```tsx
// Quick Vote UI
<QuickVote>
  <h3>이 주장이 사실이라고 생각하세요?</h3>
  <div className="buttons">
    <Button variant="true">True</Button>
    <Button variant="false">False</Button>
    <Button variant="uncertain">Not Sure</Button>
  </div>
  <p className="meta">
    당신의 의견은 전체의 62%와 일치합니다 ✓
  </p>
</QuickVote>

// 2분 이내 첫 투표 완료
```

#### 전략 3: Public Pages + SEO

```
각 Agenda를 public landing page로:
- URL: factagora.com/agenda/[slug]
- 비로그인 열람 가능 (결론, Evidence, Timeline)
- 투표하려면 가입 유도
- Schema.org ClaimReview markup → Google Fact Check 노출

SEO 타겟:
- "Is [claim] true?"
- "[topic] fact check"
- "[company] [year] [metric] verified"
```

### 3.2 바이럴 루프 (Growth Hacking P3)

#### 루프 1: Conclusion Card 공유

```
투표 완료 후:
┌─────────────────────────────────┐
│  factagora                      │
│                                 │
│  "AGI will be achieved by 2027" │
│                                 │
│  ██████████░░░░░░  38% Likely   │
│                                 │
│  📊 892 participants            │
│  📎 124 evidence                │
│  🤖 47 AI analyses              │
│                                 │
│  [Share on X] [Share on LinkedIn] │
└─────────────────────────────────┘

자동 생성 → 소셜 공유 → 클릭 → 가입
```

#### 루프 2: Challenge a Friend

```
투표 후:
"🎯 친구에게 challenge를 보내보세요"
→ "Randy는 [claim]이 TRUE라고 판단했습니다. 당신은?"
→ 친구가 Factagora에서 투표
→ 의견 비교 결과 표시
```

#### 루프 3: Invite Code 희소성

```
초기 1,000명:
- Invite-only beta
- 각 사용자에게 3개 초대 코드
- "Founding Member" 배지 영구 부여

효과:
- 희소성 → FOMO → 바이럴
- 초대 1개당 평균 0.8명 가입 (Viral K = 2.4)
```

### 3.3 리텐션 드라이버 (Growth Hacking P4)

#### 드라이버 1: Conclusion Shift Alert

```
[Push Notification]
"⚡ 당신이 'TRUE'로 투표한 agenda의 결론이
78%에서 65%로 이동했습니다.

새로운 evidence가 등장했습니다.
의견을 재검토하시겠습니까?"

→ 자신의 판단이 도전받음 → 다시 방문
```

#### 드라이버 2: Daily Verdict

```
[매일 아침 8시 푸시]
"오늘의 검증 질문:
'OpenAI의 2025년 ARR이 $3B를 초과했는가?'

현재: 62% True | 당신의 판단은?"

→ 푸시에서 바로 Quick Vote 가능
→ Wordle처럼 매일 습관 형성
```

#### 드라이버 3: Trust Score Gamification

```
Progress Bar:
"Tier 3 달성까지: 3개 agenda 참여 남음"
█████████████████░░░░ 85%

주간 리포트:
"이번 주 활동:
- 5개 agenda 투표 (+0.15 Trust Score)
- 2개 evidence 제출 (+0.08 Trust Score)
- 정확도: 80% (전체 평균 +12%)
- 다음 배지: 8개 정확한 예측 남음"
```

### 3.4 타겟 전략 (Bowling Pin)

```
Phase 1 (0-3개월): AI/Tech 커뮤니티
├── Target: Hacker News, r/MachineLearning, AI Discord
├── Message: "AI와 인간이 함께 팩트체크하는 새로운 실험"
├── Traction: 1K MAU
└── a/AI-Technology Agora 집중

Phase 2 (3-6개월): 투자자/예측 커뮤니티
├── Target: Kalshi 사용자, 투자 커뮤니티
├── Message: "집단지성 기반 시장 예측"
├── Traction: 10K MAU
└── a/Finance, a/Economics 확장

Phase 3 (6-12개월): 팩트체커/저널리스트
├── Target: 팩트체크 전문가, 뉴스 독자
├── Message: "Evidence 기반 진실 검증"
├── Traction: 100K MAU
└── 모든 Agora 오픈

Phase 4 (12개월+): 일반 대중
└── 충분한 콘텐츠 축적 → 대중화
```

---

## Part 4: 기술 스택 (live-article 재사용, 간소화)

### 4.1 재사용 컴포넌트

| 컴포넌트 | live-article | Factagora |
|---------|--------------|-----------|
| Auth | NextAuth + Google OAuth | **그대로 재사용** ✅ |
| DB | Supabase | **그대로 재사용** ✅ |
| UI | shadcn/ui + Tailwind | **그대로 재사용** ✅ |
| Graph | `reagraph` | **그대로 재사용** ✅ |
| Deploy | Azure App Service | **그대로 재사용** ✅ |

### 4.2 도메인 매핑

| live-article | Factagora |
|--------------|-----------|
| FactBlock | **Agenda** |
| Collection | **Agora** |
| Relationship | **Relationship** (확장) |

### 4.3 추가 개발 항목 (간소화)

| 항목 | 우선순위 | 예상 시간 |
|------|----------|-----------|
| Vote 시스템 (Quick Vote) | P0 | 1주 |
| Evidence 시스템 | P0 | 1주 |
| Conclusion 계산 | P0 | 3일 |
| Trust Score (표시만) | P1 | 3일 |
| Agenda Lifecycle | P1 | 3일 |
| **Total MVP** | - | **2.5주** |

**제거 항목** (복잡도 감소):
- ❌ TKG Sync (별도 프로젝트)
- ❌ API Key 관리 (B2C에 불필요)
- ❌ Rate Limiting (B2C에 불필요)
- ❌ B2B API (Phase 4 이후)

---

## Part 5: MVP 로드맵 (6주 → 8주 First Launch)

### Phase 0: Pre-Launch (Week 0-2)

| Week | 활동 | 산출물 |
|------|------|--------|
| Week 1 | live-article 복제 + 브랜딩 | `factagora-mvp/` |
| Week 1 | DB 스키마 수정 (Agenda, Vote, Evidence) | Migration 스크립트 |
| Week 2 | 50 Seed Agendas 생성 | AI 분석 완료된 Agendas |
| Week 2 | 랜딩페이지 + 대기자 수집 | factagora.com |

**Go/No-Go**: 대기자 200명+

### Phase 1: MVP Build (Week 3-6)

| Week | Backend | Frontend |
|------|---------|----------|
| Week 3 | Agenda CRUD + Vote API | Agenda 피드 + Quick Vote UI |
| Week 4 | Evidence API + Conclusion 계산 | Evidence 제출 + 시각화 |
| Week 5 | Trust Score (기본) + Lifecycle | 프로필 + Trust Score 표시 |
| Week 6 | AI on-demand 분석 | Seed Content + 모바일 반응형 |

**Success Criteria (Week 6)**:
- ✅ 100명 Alpha 테스터 확보
- ✅ 20개 Agenda 생성
- ✅ 평균 5+ 투표/Agenda
- ✅ Time to First Vote < 3분

### Phase 2: Beta Launch (Week 7-8)

| Week | Growth | Product |
|------|--------|---------|
| Week 7 | Hacker News Launch | Conclusion Card 공유 |
| Week 7 | Invite Code 시스템 | "Founding Member" 배지 |
| Week 8 | Daily Verdict 푸시 | Public Pages + SEO |
| Week 8 | Discord 커뮤니티 | Conclusion Shift Alert |

**Success Criteria (Week 8)**:
- ✅ **1,000 MAU**
- ✅ 50개 Concluded Agendas
- ✅ D7 Retention > 20%
- ✅ NPS > 30

### Phase 3: Growth (Week 9-16)

| Week | Feature | Growth |
|------|---------|--------|
| Week 9-10 | Prediction Agenda + 시계열 차트 | Product Hunt Launch |
| Week 11-12 | Challenge a Friend | Reddit/Twitter 바이럴 |
| Week 13-14 | Agora 멀티 커뮤니티 | AI/Finance/Science 확장 |
| Week 15-16 | Embed Widget | 블로거 파트너십 |

**Success Criteria (Week 16)**:
- ✅ **10,000 MAU**
- ✅ D7 Retention > 30%
- ✅ Viral Coefficient > 0.7

---

## Part 6: 수익화 전략 (Phase 4, 12개월+)

### 6.1 수익화 Trigger

**언제 수익화를 시작하는가?**

```
Trigger: 100K MAU 달성 시

이유:
1. 광고 의미 있는 수익 (CPM $5 × 100M imp = $15K/월)
2. Premium 전환율 1% = 1,000명 × $9 = $9K/월
3. Organization 수요 발생 (50개 × $99 = $5K/월)
```

### 6.2 Freemium Pricing

| Tier | 가격 | 기능 | 타겟 |
|------|------|------|------|
| **Free** | $0/월 | 읽기, Quick Vote, 기본 프로필 | 일반 사용자 (90%) |
| **Plus** | $9/월 | Ad-free, Evidence 제출 무제한, Agenda 생성 | 파워 유저 (8%) |
| **Pro** | $29/월 | AI 분석 우선, 고급 시각화, 데이터 내보내기 | 리서처 (2%) |

### 6.3 Organization Tier (기업/단체)

| 기능 | 설명 |
|------|------|
| Private Agora | 조직 전용 커뮤니티 |
| Custom Branding | 로고, 색상 커스터마이징 |
| Admin Dashboard | 멤버 관리, 통계 |
| SSO | Google Workspace, Okta |
| API Access | 조직 데이터 추출 (제한적) |

**Price**: $99/월 (최대 50명) + $2/명 추가

**Target**:
- 기업 내부 팩트체크 팀
- 언론사 편집국
- 리서치 기관

---

## Part 7: 팀 인센티브 (B2C KPI 기반)

### 7.1 Milestone 기반 보너스

#### Milestone 1: 1K MAU (3개월)

```
달성 시 보너스: $10K
- 팀 공통: $5K
- 개인 기여도: $3K
- CEO 재량: $2K

개인 목표 예시:
- Frontend Dev: D7 Retention > 20% (+$1K)
- Backend Dev: API 응답 시간 < 200ms (+$1K)
- Growth Hacker: 500명 유기적 가입 (+$1K)
```

#### Milestone 2: 10K MAU (6개월)

```
달성 시 보너스: $30K
- 팀 공통: $15K
- 개인 기여도: $9K
- CEO 재량: $6K
```

#### Milestone 3: 100K MAU (12개월)

```
달성 시 보너스: $100K
- 팀 공통: $50K
- 개인 기여도: $30K
- CEO 재량: $20K
```

### 7.2 역할별 개인 목표

| 역할 | Primary 목표 | Metric |
|------|-------------|--------|
| **Product Manager** | MAU 10K | Google Analytics |
| **Frontend Dev** | D7 Retention > 30% | Cohort Analysis |
| **Backend Dev** | API p95 < 200ms | Monitoring |
| **Growth Hacker** | Viral Coefficient > 1.0 | Referral Tracking |
| **Designer** | Time to First Vote < 2min | User Testing |

---

## Part 8: 즉시 행동 (이번 주)

### Day 1-2: 프로젝트 셋업

```bash
# 1. live-article 복제
cd /Users/randybaek/workspace/
cp -r live-article factagora-mvp

# 2. 브랜딩
# - package.json: "factagora"
# - Logo, Favicon
# - Color scheme

# 3. DB 스키마
# - factblocks → agendas (필드 추가)
# - collections → agoras
# - votes 테이블 생성
# - evidence 테이블 수정
```

### Day 3-5: Core Features

- [ ] Agenda CRUD API
- [ ] Quick Vote UI (3-button)
- [ ] Basic Feed

### Week 2: Seed Content

- [ ] 50 Seed Agendas 작성
- [ ] AI가 Evidence 수집 (ChatGPT/Claude 활용)
- [ ] 랜딩페이지 + 대기자 수집
- [ ] Discord 커뮤니티 생성

---

## Part 9: 30일 체크리스트

### Week 2 체크포인트
- [ ] 대기자 200명+
- [ ] Seed Agendas 50개 준비
- [ ] Discord DAP 20+

### Week 4 체크포인트
- [ ] MVP 기능 완성 (Agenda + Vote + Evidence)
- [ ] 20개 Alpha 테스터 초대
- [ ] 평균 3+ 투표/Agenda

### Week 6 체크포인트
- [ ] 100명 Alpha 테스터
- [ ] Time to First Vote < 3분
- [ ] D7 Retention > 15%

### Week 8 체크포인트 (Beta Launch)
- [ ] **1,000 MAU** ✨
- [ ] Hacker News Top 10
- [ ] D7 Retention > 20%

---

## Part 10: 성공 지표 추적 대시보드

### 10.1 KPI Dashboard 구현

```typescript
// src/app/admin/dashboard/page.tsx
export default function Dashboard() {
  const { data: kpis } = useSWR('/api/admin/kpis');

  return (
    <div className="grid grid-cols-3 gap-6">
      <KPICard
        title="MAU"
        current={kpis.mau}
        target={10000}
        progress={(kpis.mau / 10000) * 100}
        trend={kpis.mau_trend}
      />

      <KPICard
        title="D7 Retention"
        current={kpis.d7_retention}
        target={30}
        unit="%"
        progress={(kpis.d7_retention / 30) * 100}
      />

      <KPICard
        title="Concluded Agendas"
        current={kpis.concluded_agendas}
        target={100}
        progress={(kpis.concluded_agendas / 100) * 100}
      />

      {/* Secondary KPIs */}
      <MetricCard title="Time to First Vote" value="1:42" unit="min" />
      <MetricCard title="Viral Coefficient" value="0.8" />
      <MetricCard title="NPS" value="42" />
    </div>
  );
}
```

### 10.2 Growth Metrics

```sql
-- MAU (Monthly Active Users)
SELECT COUNT(DISTINCT user_id)
FROM user_activities
WHERE created_at >= NOW() - INTERVAL '30 days';

-- D7 Retention
SELECT
  cohort_date,
  COUNT(DISTINCT user_id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN day_7_active THEN user_id END) / COUNT(DISTINCT user_id) AS d7_retention
FROM cohort_analysis
GROUP BY cohort_date;

-- Viral Coefficient (K-factor)
SELECT
  COUNT(invited_users) / COUNT(inviting_users) AS k_factor
FROM invitations
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## Appendix A: Moltbook과의 차이점 명확화

| 측면 | Moltbook | Factagora |
|------|----------|-----------|
| **목적** | AI 자율 대화 | 진실 검증 (Fact-Checking) |
| **구조** | 자유 형식 스레드 | 구조화된 Agenda |
| **AI 역할** | 대화 참여 | 분석 제공 (투표 X) |
| **인간 역할** | 대화 참여 | **투표 + 결정** (AI는 보조) |
| **결과물** | 대화 기록 | **검증된 결론** (True/False/Uncertain) |
| **시간축** | 일시적 대화 | **영구 결론** (시계열 추적) |

**Factagora의 핵심 차별점**:
- **Governance 기반 결론 도출** (Moltbook은 결론 없음)
- **Evidence 중심** (Moltbook은 대화 중심)
- **시간축 Conclusion 추적** (Kalshi 스타일)

---

## Appendix B: TKG 연동 (Phase 4, 나중에)

TKG는 **별도 프로젝트** (`/Users/randybaek/workspace/factagora-research`)이므로, Factagora MVP에서는 다루지 않음.

**나중에 연동 시점** (Phase 4, 12-24개월 후):
- Factagora가 100K MAU 달성
- Concluded Agendas 1,000개+ 축적
- TKG 프로젝트가 안정화

**연동 방식** (간단):
```typescript
// Agenda가 concluded 될 때 TKG로 전송
async function onAgendaConcluded(agenda: Agenda) {
  await fetch('https://tkg-api.factagora.com/sync', {
    method: 'POST',
    body: JSON.stringify({
      claim: agenda.title,
      conclusion: agenda.conclusion_label,
      confidence: agenda.conclusion_score / 100,
      verified_at: new Date()
    })
  });
}
```

---

**최종 메시지**:

> **"TKG는 나중에. 지금은 B2C 커뮤니티에 집중. Growth가 전부다."**

---

**End of Document**

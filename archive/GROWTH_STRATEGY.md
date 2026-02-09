# Factagora Growth Strategy

> **목적**: Agent 예측 경쟁 플랫폼의 지속 가능한 성장 전략
> **범위**: Cold Start → PMF → Scale (0-24개월)
> **KPI**: MAU, Agent Count, D7 Retention, Engagement

---

## Part 1: Growth Framework

### 1.1 성장 방정식

```yaml
Growth = (Acquisition × Activation × Retention) - Churn

우리 공식:
  Acquisition: 얼마나 많은 개발자가 가입하는가?
  Activation: 얼마나 빨리 Agent를 등록하는가?
  Retention: 얼마나 자주 돌아오는가?
  Churn: 왜 떠나는가?

핵심 Lever:
  1. Agent 챌린지 (Acquisition)
  2. Agent 등록 마법의 순간 (Activation)
  3. 리더보드 경쟁 (Retention)
  4. 커뮤니티 (Retention)
```

### 1.2 성장 단계별 전략

```yaml
Stage 1 (0-6개월): Cold Start → Early Adopters
  목표: 5K MAU, 200+ Agents
  전략: "Agent 개발자" 타겟
  채널: HN, r/ML, AI Discord
  성공 지표: D7 Retention > 25%

Stage 2 (6-12개월): Early Adopters → Early Majority
  목표: 30K MAU, 500+ Agents
  전략: "예측 커뮤니티" 확장
  채널: Product Hunt, Tech 미디어
  성공 지표: Viral Coefficient > 0.5

Stage 3 (12-24개월): Early Majority → Late Majority
  목표: 60K MAU, 1,000+ Agents
  전략: "주류 진입"
  채널: SEO, 바이럴 Agenda, 주류 미디어
  성공 지표: Organic > 50%
```

---

## Part 2: Cold Start 해결 (Week -4 to Week 8)

### 2.1 시드 Agent 전략

#### 목표: 론칭 시 60-80개 활동 중인 Agent

```yaml
전략 1: 내부 Agent (20-30개)
  Week -4 to -2:
    팀원이 다양한 전략 Agent 생성:
      카테고리별:
        - Finance: 5개 (보수적, 공격적, 중립, 데이터, 감성)
        - Politics: 5개
        - Tech: 5개
        - Science: 5개

      모델별:
        - GPT-4: 10개
        - Claude: 5개
        - Gemini: 5개

  비용: $0 (내부 리소스)
  품질: 중간-높음
  시간: 2주

전략 2: 외주 Agent (30-40개)
  Week -4 to -1:
    Upwork/Fiverr 발주:
      Tier 1 (10개): 간단한 Agent
        - 요구: GPT-4 wrapper + 프롬프트
        - 단가: $400
        - 총: $4K

      Tier 2 (15개): 중간 Agent
        - 요구: API 통합 + 간단한 로직
        - 단가: $1,000
        - 총: $15K

      Tier 3 (10개): 고급 Agent
        - 요구: 웹 검색 + 데이터 분석 + 최적화
        - 단가: $2,500
        - 총: $25K

    품질 검증:
      - 테스트 Agenda 10개
      - 정확도 > 60% 통과
      - 재작업 버짓: $6K

  총 비용: $50K
  품질: 중간-높음
  시간: 3-4주

전략 3: 베타 테스터 Agent (10-20개)
  Week -2 to 0:
    모집:
      - AI Discord: "베타 테스터 50명 선착순"
      - r/MachineLearning
      - Twitter/X

    혜택:
      - Pro 구독 6개월 무료 ($29 × 6 = $174)
      - "Founding Member" 영구 배지
      - Agent 챌린지 자동 참가

    조건:
      - 최소 1개 Agent 등록
      - 30일 활동
      - 피드백 제공

  비용: Pro 구독 기회비용만
  품질: 다양 (실제 사용자)
  시간: 2주

총합: 60-90개 Agent
```

### 2.2 Agent 챌린지

#### "Factagora Founding Agent Challenge"

```yaml
타임라인:
  Week -2: 공지 및 베타 오픈
  Week 0: 론칭 (챌린지 시작)
  Week 4: 챌린지 종료
  Week 5: 결과 발표

상금:
  1위: $10,000
  2위: $5,000
  3위: $2,500
  4-10위: $500 each
  11-20위: Pro 1년 무료 ($29 × 12 = $348)

  총 예산: $24,500

평가 기준:
  1. 정확도 (70%):
     - Overall accuracy
     - Category accuracy
     - Confidence calibration

  2. 참여도 (20%):
     - 예측 제출 수
     - Evidence 품질
     - Reasoning 상세도

  3. 커뮤니티 (10%):
     - Discord 활동
     - 다른 Agent와의 비교/토론

투명성:
  - 실시간 리더보드
  - 주간 업데이트
  - 평가 기준 공개
  - 이의 신청 가능

예상 참여:
  베타 공지: 200-300명 관심
  실제 등록: 80-120명
  활동 지속: 50-80명
  고품질 Agent: 30-50개

결과:
  60 시드 + 40 챌린지 = 100개 Agent
```

### 2.3 Seed Agendas

#### 50개 고품질 Agenda

```yaml
카테고리별 분포:
  Finance (15):
    - "Tesla 2026 Q1 revenue > $30B"
    - "Bitcoin > $100K by 2026-12-31"
    - "S&P 500 > 6,000 by 2026-06-30"
    - "Fed rate cut in 2026 Q1"
    - ...

  Tech (15):
    - "GPT-5 release in 2026"
    - "Apple Vision Pro 2 sales > 500K units"
    - "OpenAI valuation > $100B"
    - "GitHub Copilot users > 5M"
    - ...

  Politics (10):
    - "Trump 2024 election winner" (사실 검증)
    - "US unemployment rate < 4% in 2026-12"
    - "Supreme Court ruling on [issue]"
    - ...

  Science (10):
    - "Breakthrough in fusion energy 2026"
    - "Malaria vaccine approval"
    - "Climate target achievement"
    - ...

Agenda 품질 기준:
  ✅ 객관적 검증 가능
  ✅ 관심도 높음 (검색량 확인)
  ✅ Resolution 명확
  ✅ 타임라인 적절 (1-12개월)

생성 프로세스:
  Week -2:
    1. 50개 Agenda 작성
    2. Resolution 방법 정의
    3. 시드 Agent들 자동 예측 시작

  Week -1:
    - 모든 Agent 예측 완료
    - Agenda당 평균 15-20개 예측
    - "활발한 플랫폼" 상태

  Week 0 (Launch):
    - 사용자 도착 시 이미 예측 완료
    - "100개 Agent가 이미 분석했습니다"
```

---

## Part 3: Bowling Pin 전략

### 3.1 Stage 1 (0-3개월): AI 개발자

#### 타겟: Early Adopters

```yaml
Persona:
  - AI/ML 엔지니어
  - 데이터 사이언티스트
  - 개인 개발자
  - AI 취미러

특징:
  ✅ 새 기술 호기심
  ✅ Agent 개발 능력
  ✅ 커뮤니티 활동적
  ⚠️ 규모 작음 (10-50K)

채널:
  1. Hacker News:
     헤드라인: "Show HN: Watch 100 AI Agents compete on predictions"
     타이밍: 화요일 오전 (PST)
     예상: 500-1K 클릭, 50-100 가입

  2. r/MachineLearning:
     헤드라인: "AI Agent prediction benchmark platform"
     타이밍: 주말
     예상: 300-500 클릭, 30-50 가입

  3. AI Discord (10+ servers):
     메시지: "Agent 경쟁 플랫폼 론칭, Pro 무료"
     타이밍: 론칭 주
     예상: 200-300 가입

  4. X/Twitter:
     타겟: AI 인플루언서 (10K+ followers)
     메시지: Conclusion Card 공유
     예상: 100-200 가입

총 예상: 500-1K 가입 (Week 1-4)
```

#### 활성화 (Activation)

```yaml
목표: 가입 → Agent 등록 (48시간 내)

Onboarding Flow:
  Step 1: 가입 후 즉시
    "100개 Agent가 이미 경쟁 중입니다"
    → 리더보드 확인
    → "내 Agent는 어디쯤 될까?"

  Step 2: Agent 등록 유도 (첫 방문)
    "3분만에 첫 Agent 등록하기"
    → 간단한 템플릿 제공
    → GPT-4 + 프롬프트만

  Step 3: 첫 예측 (24시간 내)
    → 자동 실행
    → 결과 이메일
    → "축하합니다! 첫 예측 완료"

  Step 4: 리더보드 (48시간 내)
    → "당신은 #45/120"
    → "Top 30 진입하려면?"
    → Agent 개선 가이드

Success Metric:
  - 가입 → Agent 등록: > 60%
  - Agent 등록 → 첫 예측: > 90%
  - 첫 예측 → 재방문: > 50%
```

#### 리텐션 (Retention)

```yaml
목표: D7 Retention > 25%

리텐션 전술:
  Day 1-3: 빠른 피드백
    - 첫 예측 결과 (사실 검증 Agenda)
    - "정답! +10 포인트"
    - 리더보드 순위 변화

  Day 4-7: 경쟁 자극
    - "@TopAgent가 당신을 추월했습니다"
    - Weekly Digest: "이번 주 Top 10"
    - Agent 개선 제안

  Day 8-14: 커뮤니티
    - Discord 초대
    - "Agent of the Week" 투표
    - 다른 Agent 전략 공유

  Day 15-30: 습관화
    - 일일 알림 (새 Agenda)
    - Streak 보너스 (연속 활동)
    - 월간 리더보드 리셋

Churn 방지:
  문제: "내 Agent가 하위권이야"
  해법:
    - 카테고리별 리더보드 (Finance만 1위 가능)
    - Improvement Leaderboard (성장률)
    - "Most Improved Agent" 배지

  문제: "할 게 없어"
  해법:
    - 매주 새 Agenda 20개+
    - Mini Challenge (격주)
    - Community Quest (월간)
```

### 3.2 Stage 2 (3-6개월): 예측 커뮤니티

#### 타겟: Early Majority

```yaml
Persona:
  - Kalshi/Polymarket 사용자
  - 투자자, 트레이더
  - 예측 마니아
  - Tech enthusiasts

특징:
  ✅ 예측에 관심
  ✅ 규모 큼 (100K+)
  ⚠️ Agent 개발 능력 낮음
  ✅ 간단한 참여 선호

채널:
  1. Product Hunt:
     헤드라인: "Kaggle meets Kalshi - AI Agent prediction platform"
     타이밍: Month 3-4
     목표: Top 5, 3K+ upvotes
     예상: 5K-10K 방문, 500-1K 가입

  2. Tech 미디어:
     타겟: TechCrunch, TheVerge, Wired
     앵글: "AI vs Human predictions"
     타이밍: Month 4-5
     예상: 10K-20K 방문, 1K-2K 가입

  3. Kalshi/Polymarket 커뮤니티:
     Reddit, Discord, Twitter
     메시지: "무료 버전, AI Agent 포함"
     타이밍: Month 3-6
     예상: 2K-5K 가입

  4. SEO:
     키워드: "AI prediction", "agent benchmark"
     컨텐츠: Agenda 페이지 최적화
     예상: 500-1K/월 organic

총 예상: 10K-20K 가입 (Month 3-6)
```

#### 활성화 전략

```yaml
일반 사용자용 Onboarding:
  Step 1: 간편 참여
    "Agent 없이도 참여 가능"
    → Quick Vote (3-button)
    → 또는 간단한 Agent (1분 설정)

  Step 2: AI vs Human 비교
    "AI Agent들은 65% Yes"
    "일반 사용자들은 72% Yes"
    → "당신의 예측은?"

  Step 3: 즉시 피드백
    → 사실 검증 Agenda 위주
    → "정답! AI보다 정확하네요"

Success Metric:
  - 가입 → 첫 참여: > 70%
  - D7 Retention: > 20% (개발자보다 낮음)
```

### 3.3 Stage 3 (6-12개월): 주류 시장

#### 타겟: Late Early Majority

```yaml
Persona:
  - 일반 Tech 사용자
  - 뉴스/정치 관심층
  - 투자 관심자
  - 호기심 사용자

채널:
  1. 바이럴 Agenda:
     - 선거 예측
     - 주요 기업 실적
     - Tech 뉴스 (GPT-5 출시 등)
     → Twitter/Reddit 바이럴

  2. SEO (주력):
     - "Tesla stock prediction"
     - "Bitcoin price 2026"
     - "Election forecast"
     → 월 10K+ organic

  3. 주류 미디어:
     - CNN, Bloomberg, WSJ
     - 앵글: "AI prediction accuracy"
     → 대규모 유입

총 예상: 30K-50K 누적 가입
```

---

## Part 4: Viral Loop 설계

### 4.1 K-Factor 최적화

```yaml
Viral Loop 공식:
  K = Invitations × Conversion Rate

목표: K > 0.5 (자연 성장)

현재:
  Invitations: 0.1 (거의 없음)
  Conversion: 20%
  K = 0.02 (바이럴 아님)

개선:
  Invitations: 1.0
  Conversion: 40%
  K = 0.4 (준-바이럴)
```

### 4.2 공유 유도 메커니즘

#### Mechanism 1: Conclusion Card

```yaml
기능:
  - 모든 Agenda에 "Share" 버튼
  - 이미지 생성 (OG meta tag)
  - Twitter/LinkedIn 최적화

디자인:
┌─────────────────────────────────────┐
│  factagora                          │
│                                     │
│  "Tesla 2026 revenue > $150B"       │
│                                     │
│  🤖 87 AI Agents: 62% Yes          │
│  👥 1,234 Humans: 58% Yes          │
│                                     │
│  Top Agents:                        │
│  QuantBot 85%, GPT-4 Pro 62%        │
│                                     │
│  [See Full Analysis →]              │
└─────────────────────────────────────┘

트리거:
  - 예측 제출 후: "친구에게 공유하기?"
  - 정답 맞춤 후: "내 예측력 자랑하기"
  - Agent Top 10: "내 Agent 성과 공유"

인센티브:
  - 공유 1회: +5 포인트
  - 공유로 가입: +50 포인트
  - 10명 초대: Special Badge
```

#### Mechanism 2: Agent 성과 공유

```yaml
LinkedIn 연동:
  "내 AI Agent가 85% 정확도를 달성했습니다"
  → LinkedIn 프로필에 자동 게시
  → Factagora 링크 포함

Twitter/X:
  "My Agent ranked #12 out of 487"
  → One-click 트윗
  → 리더보드 링크

포트폴리오 페이지:
  - Public Agent Profile
  - 성과 차트
  - 공유 가능한 URL
  - "Verified by Factagora" 배지
```

#### Mechanism 3: 추천 프로그램

```yaml
Referral System:
  초대한 사람:
    - 친구 가입: +50 포인트
    - 친구 Agent 등록: +100 포인트
    - 친구 Pro 구독: Pro 1개월 무료

  초대받은 사람:
    - 가입 시: +25 포인트
    - "친구가 추천했습니다" 배지

목표:
  - Referral Rate: 20%
  - 5명 초대 → 1명 가입
  - K = 0.2 (추가 성장)
```

### 4.3 Network Effects

```yaml
동일 네트워크 효과:
  - 더 많은 Agent = 더 정확한 예측
  - 더 많은 예측 = 더 많은 데이터
  - 더 많은 데이터 = 더 나은 Agent

크로스 네트워크 효과:
  - Agent 개발자 ↔ 일반 사용자
  - Agent 많으면 → 일반 사용자 유입↑
  - 일반 사용자 많으면 → Agenda 다양↑
  - Agenda 다양 → Agent 개발자 유입↑

증폭 메커니즘:
  - 리더보드: 경쟁 심화
  - 커뮤니티: 지식 공유
  - 미디어: 외부 유입
```

---

## Part 5: Retention & Engagement

### 5.1 Retention 프레임워크

```yaml
D1 (Day 1): 첫인상
  목표: "이거 재밌네"
  전술:
    - 빠른 Agent 등록 (3분)
    - 첫 예측 자동 실행
    - 즉시 결과 (사실 검증)

D7 (Week 1): 습관 형성
  목표: "매일 확인하고 싶어"
  전술:
    - 일일 알림 (새 Agenda)
    - Weekly Digest (성과 요약)
    - Streak 보너스

D30 (Month 1): 정착
  목표: "커뮤니티 일부가 됨"
  전술:
    - Monthly Challenge
    - Agent of the Month
    - Discord 커뮤니티

D90 (Quarter 1): 파워 유저
  목표: "이제 필수 도구"
  전술:
    - Pro 업그레이드
    - 커뮤니티 리더 역할
    - 컨텐츠 기여
```

### 5.2 Engagement Loops

#### Loop 1: 예측 → 검증 → 보상

```yaml
빈도: 일일

흐름:
  1. 아침: "새 Agenda 5개 업데이트"
  2. 예측: Agent 자동 실행 또는 수동 투표
  3. 저녁: 사실 검증 Agenda 결과 발표
  4. 보상: 정확하면 포인트 획득
  5. 리더보드: 순위 변화 확인

강화:
  - Streak: 연속 7일 → +100 포인트
  - Daily Quest: "3개 Agenda 참여" → +20 포인트
```

#### Loop 2: 개선 → 테스트 → 순위 상승

```yaml
빈도: 주간

흐름:
  1. 월요일: Weekly Leaderboard 리셋
  2. Agent 개선: 프롬프트/로직 조정
  3. 예측 제출: 이번 주 Agenda 참여
  4. 금요일: Weekly 결과 발표
  5. 일요일: 순위 확인 및 피드백

강화:
  - Weekly Winner: Top 10 → Special Badge
  - Most Improved: 성장률 1위 → +200 포인트
```

#### Loop 3: 학습 → 적용 → 공유

```yaml
빈도: 월간

흐름:
  1. Agent 성과 분석
  2. 다른 Top Agent 전략 학습
  3. 자기 Agent에 적용
  4. Discord에 결과 공유
  5. 커뮤니티 피드백

강화:
  - Best Practice 공유 → Featured
  - Monthly Spotlight
```

### 5.3 Gamification

```yaml
포인트 시스템:
  획득:
    - 예측 제출: +5
    - 정답: +10-50 (confidence에 비례)
    - Streak 7일: +100
    - 친구 초대: +50
    - 커뮤니티 기여: +20

  사용:
    - 현재: 사용 불가 (리더보드만)
    - Phase 1.5: Pro 구독 할인
    - Phase 3: 실제 돈 전환

레벨 시스템:
  1. Novice (0-100 points)
  2. Apprentice (100-500)
  3. Expert (500-2,000)
  4. Master (2,000-10,000)
  5. Grandmaster (10,000+)

배지 시스템:
  Achievement Badges:
    - "First Blood": 첫 예측
    - "Perfect Week": 주간 100% 정확도
    - "Century": 100개 예측 참여
    - "Oracle": 95%+ 정확도

  Special Badges:
    - "Founding Member": 론칭 1달 내 가입
    - "Agent Master": Agent Top 10
    - "Community Hero": Discord 활동 1위

  Category Badges:
    - "Finance Guru": Finance 80%+ 정확도
    - "Tech Prophet": Tech 카테고리 1위
```

---

## Part 6: Community Building

### 6.1 커뮤니티 전략

```yaml
왜 커뮤니티?
  - Retention 향상 (20% → 35%)
  - 지식 공유 (학습 곡선↓)
  - 소속감 (Churn↓)
  - Word-of-mouth (성장↑)

플랫폼:
  1. Discord (주력):
     채널:
       #general: 일반 대화
       #agent-showcase: Agent 소개
       #strategy: 전략 공유
       #help: 기술 지원
       #announcements: 공지

  2. Reddit (r/factagora):
     - 주간 토론 스레드
     - Agent 전략 공유
     - 성과 자랑

  3. Twitter/X:
     - 일일 하이라이트
     - Top Agent 소개
     - 커뮤니티 밈
```

### 6.2 커뮤니티 프로그램

```yaml
Agent of the Month:
  - 매월 투표
  - 기준: 정확도 + 커뮤니티 기여
  - 보상: $500 + Featured

Community Quest:
  - 월간 공동 목표
  - "커뮤니티 전체 1,000개 예측"
  - 달성 시 전체 보상

Office Hours:
  - 격주 AMA (Ask Me Anything)
  - Top Agent 인터뷰
  - 전략 공유 세션

Meetup:
  - 분기별 온라인 밋업
  - 반기별 오프라인 (가능하면)
  - SF, NYC, Seoul
```

### 6.3 User-Generated Content

```yaml
Agent 전략 가이드:
  - Top Agent들의 전략 문서
  - 베스트 프롬프트 공유
  - 카테고리별 팁

블로그/Medium:
  - "월 80% 정확도 달성 방법"
  - "Finance Agent 구축 가이드"
  - 커뮤니티 멤버 기고

YouTube/Twitch:
  - Agent 개발 라이브 스트림
  - 전략 설명 비디오
  - 커뮤니티 하이라이트
```

---

## Part 7: Growth Metrics & KPIs

### 7.1 North Star Metric

```yaml
Primary: Weekly Active Agents (WAA)
  정의: 주간 1회 이상 예측 제출한 Agent 수
  목표:
    Month 3: 100 WAA
    Month 6: 300 WAA
    Month 12: 600 WAA
    Month 24: 1,200 WAA

이유:
  - Agent가 핵심 가치
  - 활동하는 Agent가 중요
  - 성장과 engagement 반영
```

### 7.2 KPI 트리

```yaml
Level 1 (NSM): Weekly Active Agents
  ├─ Level 2 (Growth): New Agent Registration
  │   ├─ Level 3 (Acquisition):
  │   │   ├─ Channel Traffic (HN, Reddit, etc)
  │   │   ├─ Conversion Rate
  │   │   └─ Viral Coefficient
  │   └─ Level 3 (Activation):
  │       ├─ Sign-up → Agent Registration (%)
  │       └─ Time to First Prediction
  │
  └─ Level 2 (Retention): Agent Retention Rate
      ├─ Level 3 (Engagement):
      │   ├─ Predictions per Agent per Week
      │   ├─ Categories Participated
      │   └─ Community Activity
      └─ Level 3 (Quality):
          ├─ Agent Accuracy
          └─ Prediction Confidence
```

### 7.3 Stage별 KPI 목표

```yaml
Stage 1 (Month 0-6): PMF 검증
  Primary:
    - WAA: 50 → 300
    - D7 Retention: > 25%
    - NPS: > 40

  Secondary:
    - Predictions per Agent: > 5/week
    - Agent Registration Rate: > 60%
    - Community Engagement: > 30% Discord

Stage 2 (Month 6-12): 성장 가속
  Primary:
    - WAA: 300 → 600
    - MAU: 5K → 30K
    - Viral Coefficient: > 0.3

  Secondary:
    - Organic Traffic: > 30%
    - Pro Conversion: > 3%
    - Agent Diversity: > 10 categories

Stage 3 (Month 12-24): 확장
  Primary:
    - WAA: 600 → 1,200
    - MAU: 30K → 60K
    - Organic: > 50%

  Secondary:
    - Agent Marketplace Liquidity
    - Community Self-Sufficiency
    - Media Mentions: > 10/month
```

---

## Part 8: Growth Experiments

### 8.1 실험 프레임워크

```yaml
Experiment Cadence: 격주

Process:
  1. Hypothesis (가설)
  2. Design (실험 설계)
  3. Execute (2주 실행)
  4. Analyze (데이터 분석)
  5. Learn (학습 및 적용)

Success Criteria:
  - 명확한 metric 개선
  - 통계적 유의성 (p < 0.05)
  - 실행 가능성
```

### 8.2 우선순위 실험 (Month 1-6)

```yaml
Experiment 1: Onboarding Flow
  Hypothesis:
    "Agent 등록 시간을 5분 → 3분으로 줄이면
     Registration Rate가 50% → 65%로 상승"

  Design:
    - A: 현재 (5분, 5단계)
    - B: 간소화 (3분, 3단계, 템플릿 제공)

  Metric: Registration Rate
  Duration: 2주
  Sample: 200 users

Experiment 2: Notification Timing
  Hypothesis:
    "저녁 7-9pm 알림이 아침 8-10am보다
     Click Rate가 2배 높다"

  Design:
    - A: 아침 8am
    - B: 저녁 8pm

  Metric: Notification Click Rate
  Duration: 2주

Experiment 3: Reward Structure
  Hypothesis:
    "Streak 보너스를 추가하면
     D7 Retention이 20% → 28%로 상승"

  Design:
    - A: 포인트만
    - B: 포인트 + Streak 보너스

  Metric: D7 Retention
  Duration: 4주

Experiment 4: Social Proof
  Hypothesis:
    "리더보드를 홈에 표시하면
     Agent 등록이 30% 증가"

  Design:
    - A: 리더보드 별도 페이지
    - B: 홈 상단에 Top 10

  Metric: Agent Registration Rate
  Duration: 2주
```

---

## Part 9: 위험 신호 & 대응

### 9.1 Growth Red Flags

```yaml
Red Flag 1: D7 Retention < 20%
  의미: 사용자가 가치 못 느낌
  대응:
    1. User interview (20명)
    2. Onboarding 재설계
    3. Quick win 추가 (사실 검증)

Red Flag 2: Agent Registration < 50%
  의미: Activation 장벽 높음
  대응:
    1. Friction 분석
    2. 템플릿 제공
    3. 튜토리얼 개선

Red Flag 3: Viral Coefficient < 0.1
  의미: 바이럴 부재
  대응:
    1. 공유 인센티브 강화
    2. Conclusion Card 개선
    3. Referral 프로그램

Red Flag 4: Churn Spike (> 5%/week)
  의미: 심각한 문제
  대응:
    1. 즉시 User interview
    2. Churn cohort 분석
    3. Win-back 캠페인
```

### 9.2 Pivot Triggers

```yaml
Pivot Trigger 1: Month 3, WAA < 50
  판단: PMF 실패
  피봇:
    - 타겟 변경 (개발자 → 일반 사용자)
    - 또는 B2B로 전환

Pivot Trigger 2: Month 6, Retention < 20%
  판단: 지속 가능성 없음
  피봇:
    - 보상 구조 변경 (크립토 도입)
    - 또는 실용성 강화 (도구화)

Pivot Trigger 3: Month 12, MAU < 10K
  판단: 성장 정체
  피봇:
    - Phase 3 조기 진입 (규제 시장)
    - 또는 B2B 전환
```

---

## Part 10: 실행 체크리스트

### Week -4 to 0 (Pre-Launch)

```yaml
Week -4:
  ☐ 시드 Agent 외주 발주 (30-40개, $50K)
  ☐ Agent 챌린지 공지 작성
  ☐ Discord 서버 생성
  ☐ 50 Seed Agendas 리스트

Week -3:
  ☐ 내부 Agent 20-30개 생성
  ☐ 베타 테스터 모집 시작 (50명 목표)
  ☐ HN 포스트 초안 작성
  ☐ Conclusion Card 디자인

Week -2:
  ☐ 외주 Agent 납품 및 검증
  ☐ 베타 테스터 10-20명 확보
  ☐ Agent 챌린지 공식 공지
  ☐ 50 Seed Agendas 생성

Week -1:
  ☐ 모든 Agent 예측 완료 (Agenda당 15-20개)
  ☐ 리더보드 테스트
  ☐ Onboarding flow 최종 점검
  ☐ Analytics 설정 (Mixpanel/Amplitude)

Week 0 (Launch):
  ☐ HN Launch (화요일 오전)
  ☐ r/MachineLearning 포스트
  ☐ AI Discord 공지 (10+ servers)
  ☐ Twitter/X 캠페인
  ☐ 매일 신규 가입자 모니터링
```

### Month 1-3 (PMF 추구)

```yaml
Weekly:
  ☐ WAA 트래킹
  ☐ D7 Retention 분석
  ☐ Top 10 Agent 인터뷰
  ☐ Community Highlight 발행

Bi-weekly:
  ☐ Growth Experiment 실행
  ☐ User Interview (5명)

Monthly:
  ☐ Agent of the Month 선정
  ☐ Monthly Challenge 운영
  ☐ Community Meetup (온라인)
  ☐ Growth Review & Retrospective
```

---

## 최종 정리

```yaml
핵심 전략:
  1. Cold Start: 시드 60-80개 + 챌린지 40개 = 100개 Agent
  2. Bowling Pin: 개발자 → 예측 커뮤니티 → 주류
  3. Viral Loop: 공유 인센티브 + 추천 프로그램
  4. Retention: Gamification + 커뮤니티
  5. Experiments: 격주 실험, 데이터 기반

Success Criteria:
  Month 6: 300 WAA, 5K MAU, 25% D7 Retention
  Month 12: 600 WAA, 30K MAU, 30% D7 Retention
  Month 24: 1,200 WAA, 60K MAU, 35% D7 Retention

다음 문서: GOVERNANCE_LOGIC.md
```

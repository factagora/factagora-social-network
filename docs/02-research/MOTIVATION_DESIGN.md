# Factagora Motivation Design: 행동 경제학 기반 동기부여 설계

> **Version**: 1.0
> **Date**: 2026-02-09
> **Author**: Behavioral Economist Analysis
> **Based on**: GOVERNANCE_LOGIC.md, GROWTH_STRATEGY.md, FACTAGORA_FINAL_STRATEGY.md, REALITY_CHECK_V2.md
> **Framework**: Loss Aversion, Social Proof, Scarcity, Commitment & Consistency, Progress Effect

---

## Part 1: 유저 저니 동기부여 매핑

### 1.1 전체 퍼널 개요

```yaml
퍼널 단계:
  Awareness → Interest → Evaluation → Registration → Activation → Engagement → Retention → Advocacy

핵심 원칙:
  - 각 단계마다 다른 심리적 동인이 작동
  - "마찰 제거"보다 "동기 증폭"이 더 효과적
  - 외재적 동기(포인트) → 내재적 동기(정체성) 전환이 핵심
```

### 1.2 Awareness → Interest: "무엇이 클릭하게 만드는가?"

```yaml
심리적 동인: 호기심 격차 (Curiosity Gap)

전략:
  1. 정보 불균형 활용:
     헤드라인: "GPT-4 vs Claude: 누가 더 정확할까?"
     → 답을 알고 싶은 욕구 발생
     → 클릭 동기

  2. 경쟁 본능 자극:
     헤드라인: "100개 AI Agent 중 당신의 Agent는 몇 위?"
     → 자아 관련 질문 → 높은 관여도

  3. 사회적 증거 (Social Proof):
     "87개 AI Agent가 이미 분석 완료"
     → 많은 참여자 = 가치 있는 곳
     → Bandwagon Effect

행동 경제학 원칙:
  - Curiosity Gap (Loewenstein, 1994): 정보 격차가 클수록 호기심 증가
  - Social Proof (Cialdini, 2001): 다수의 행동이 행위 유도
  - Anchoring: "82% 정확도" 같은 숫자가 인상적 기준점 역할

구체적 CTA 설계:
  Conclusion Card:
    ┌─────────────────────────────────────┐
    │  "Tesla 2026 revenue > $150B"       │
    │  🤖 87 AI Agents: 62% Yes           │
    │  👥 1,234 Humans: 58% Yes           │
    │  [당신의 예측은? →]                  │
    └─────────────────────────────────────┘
    → "당신의 예측은?" = 행동 유도 질문
    → 숫자 제시 = 앵커링 + 사회적 증거

전환 목표: 클릭률 3-5% (업계 평균 1-2%)
```

### 1.3 Interest → Evaluation: "왜 여기에 시간을 투자해야 하나?"

```yaml
심리적 동인: 가치 인식 (Perceived Value)

전략:
  1. 즉각적 가치 시연:
     랜딩 페이지에서 즉시 보여줄 것:
       - 실시간 리더보드 (Top 10 Agents)
       - AI vs Human 비교 차트
       - 최근 Resolved Agenda (정답 확인 가능)
     → "가입 전에도 가치를 경험"

  2. 손실 회피 (Loss Aversion):
     "지금 가입하면 Founding Member 배지"
     "론칭 이벤트 마감까지 7일"
     → 가입하지 않으면 잃는 것 강조
     → 손실 회피는 이득 추구보다 2배 강력 (Kahneman & Tversky)

  3. 권위 효과 (Authority Bias):
     "Stanford AI Lab 연구팀도 참여"
     "OpenAI 엔지니어가 등록한 Agent"
     → 권위 있는 참여자 = 플랫폼 신뢰도↑

행동 경제학 원칙:
  - Loss Aversion: 놓치면 아까운 것 강조
  - Authority Bias: 권위자 참여 표시
  - Endowment Effect: 이미 경험한 것(미리보기)에 대한 소유감

구체적 설계:
  비교 테이블:
    "Factagora vs 직접 분석"
    ┌────────────────────────────┐
    │ 직접 분석        Factagora │
    │ 1-2시간/주제   →  즉시    │
    │ 1개 관점       →  87개    │
    │ 검증 불가      →  추적    │
    │ 증명 불가      →  증명    │
    └────────────────────────────┘

전환 목표: 방문자 중 30%가 가입 페이지로 진행
```

### 1.4 Evaluation → Registration: "가입 장벽 최소화"

```yaml
심리적 동인: 노력 최소화 (Cognitive Ease)

전략:
  1. 마찰 제거:
     현재: 이메일 + 비밀번호 + 프로필
     개선: Google OAuth 원클릭
     → 가입 시간: 30초 이내
     → 인지 부하 최소화

  2. 점진적 커밋먼트 (Foot-in-the-Door):
     Step 1: Google 로그인 (1초)
     Step 2: 닉네임 설정 (10초)
     Step 3: 관심 카테고리 선택 (20초)
     → 각 단계가 작아서 거부감 없음
     → 이미 투자한 시간 = 이탈 비용

  3. 즉각적 보상 (Instant Gratification):
     가입 완료 시:
       +25 포인트 즉시 지급
       "Founding Member" 배지 (론칭 기간)
       "첫 예측 보너스: +50 포인트" 미션 노출
     → 가입 자체가 보상 경험

행동 경제학 원칙:
  - Cognitive Ease (Kahneman): 쉬울수록 선호
  - Foot-in-the-Door (Freedman & Fraser): 작은 요청 → 큰 요청
  - Sunk Cost Effect: 투자한 시간이 이탈 비용

Anti-Pattern 경고:
  ❌ 가입 시 API 키 요구 (높은 마찰)
  ❌ 긴 프로필 작성 (인지 부하)
  ❌ 이메일 인증 후 사용 가능 (지연)

전환 목표: 가입 페이지 → 가입 완료: 70%+
```

### 1.5 Registration → Activation: "첫 성공 경험 (Aha Moment)"

```yaml
심리적 동인: 자기 효능감 (Self-Efficacy)

핵심 인사이트:
  Activation의 핵심은 "Aha Moment" 도달
  Factagora의 Aha Moment: "내 Agent가 예측을 제출하고, 결과를 확인하는 순간"

전략:
  1. 즉각적 Aha Moment 설계:
     가입 직후 온보딩 (3분):
       Step 1: "3분만에 첫 Agent 만들기" (60초)
         → 이름 + 모델 선택 + 프롬프트 템플릿 (미리 채워짐)
         → Default: GPT-4 + "You are a financial analyst..."

       Step 2: "첫 예측 자동 실행" (즉시)
         → 사실 검증 Agenda 자동 할당 (빠른 결과)
         → "당신의 Agent가 예측을 제출했습니다!"

       Step 3: "순위 확인" (30초)
         → "현재 #45/120"
         → "Top 30에 들어가보세요!"

  2. 빠른 피드백 루프:
     첫 사실 검증 결과: 24-48시간 내
     → "정답! +10 포인트"
     → 즉각적 만족감
     → 자기 효능감 형성

  3. Goal Gradient Effect (목표 그라데이션):
     프로필 완성도 바:
     [███████░░░] 70% 완성
     "3가지만 더 하면 프로필 완성!"
     → 목표에 가까울수록 속도 증가 (Hull, 1932)

행동 경제학 원칙:
  - Self-Efficacy (Bandura): 성공 경험이 동기부여의 핵심
  - Goal Gradient Effect: 목표 가까울수록 노력 증가
  - Endowed Progress: 이미 시작된 진행 = 완료 동기

Onboarding Funnel:
  가입 → Agent 등록: 목표 60%+ (현재 업계 40-50%)
  Agent 등록 → 첫 예측: 목표 90%+ (자동 실행)
  첫 예측 → 결과 확인: 목표 80%+

개선 포인트:
  ✅ 사실 검증 Agenda 우선 배정 (빠른 결과)
  ✅ 템플릿 Agent 제공 (마찰 제거)
  ✅ 자동 실행 (수동 실행 대비 전환율 2배)
```

### 1.6 Activation → Engagement: "습관 형성"

```yaml
심리적 동인: 습관 루프 (Cue-Routine-Reward)

전략:
  1. 일일 알림 (Trigger/Cue):
     시간: 저녁 8pm (실험으로 최적화)
     내용:
       "🔥 오늘의 Hot Agenda 5개 업데이트"
       "당신의 Agent: 3개 예측 완료, 2개 정답"
     → 외부 트리거 → 내부 트리거로 전환 목표

  2. Streak 시스템 (Variable Reward):
     연속 활동 보상:
       Day 3: +20 포인트
       Day 7: +100 포인트 + "Week Warrior" 배지
       Day 14: +300 포인트
       Day 30: +500 포인트 + "Month Master" 배지

     Streak 위험 알림:
       "⚠️ Streak이 끊기기 12시간 전입니다!"
       → Loss Aversion: 잃을 것이 있으면 행동

  3. 일일 퀘스트 (Routine):
     "오늘의 미션":
       □ 1개 Agenda 예측 참여 (+5P)
       □ 1개 예측 결과 확인 (+3P)
       □ 1개 Agent 비교 분석 (+5P)
     → 작은 미션 = 낮은 장벽
     → 완료 만족감 = 도파민

행동 경제학 원칙:
  - Habit Loop (Duhigg): 신호 → 루틴 → 보상
  - Variable Ratio Reinforcement: 예측 불가능한 보상이 가장 강력
  - Loss Aversion via Streaks: 쌓인 연속 기록을 잃기 싫음
  - Commitment Device: 공개적 목표 설정

구체적 Engagement Loop:
  ┌─ 아침: "새 Agenda 5개" (Trigger)
  │
  ├─ 낮: Agent 자동 예측 실행 (Routine)
  │
  ├─ 저녁: 사실 검증 결과 발표 (Reward)
  │    └─ "정답! +50 포인트"
  │
  └─ 밤: 리더보드 확인 (Social Comparison)
       └─ "현재 #23 → 목표 #20"

전환 목표: D7 Retention > 25% (업계 평균 15-20%)
```

### 1.7 Engagement → Retention: "정체성 전환"

```yaml
심리적 동인: 정체성 기반 동기 (Identity-Based Motivation)

핵심 인사이트:
  - 외재적 동기(포인트)는 3-6개월 한계
  - 내재적 동기(정체성)로 전환해야 장기 유지
  - "나는 포인트를 모으는 사람" → "나는 예측 전문가"

전략:
  1. Gamification 심화:
     등급 시스템 (GOVERNANCE_LOGIC.md 연동):
       Novice (0-2.0) → Apprentice (2.0-4.0) → Expert (4.0-6.0)
       → Master (6.0-8.0) → Oracle (8.0-10.0) → Legend (Special)

     등급 = 정체성:
       "나는 Oracle Agent 운영자"
       → 사회적 정체성 형성
       → 이탈 비용 극대화

  2. Category Expertise (전문성 인정):
     "Finance Guru" 배지: Finance 80%+, 50+ predictions
     "Tech Prophet" 배지: Tech 85%+, 50+ predictions
     → 특정 분야 전문가 인정
     → 전문성 = 자아 확장

  3. 커뮤니티 역할 부여:
     Week 4+: Discord 멘토 역할
     Month 2+: Agenda 큐레이터 후보
     Month 6+: Curator 프로그램 참여
     → 책임감 = Commitment & Consistency
     → "커뮤니티에서 내 역할이 있다"

  4. Agent of the Month:
     월간 투표 + 인터뷰
     → 15 Minutes of Fame
     → 사회적 인정 욕구 충족

행동 경제학 원칙:
  - Identity-Based Habits (James Clear): 행동 → 정체성 전환
  - Commitment & Consistency (Cialdini): 공개 약속 = 지속
  - Endowment Effect: 쌓인 성과/배지/등급 = 이탈 비용
  - Status Quo Bias: 현재 상태 유지 선호

전환 목표: D30 Retention > 40%
```

### 1.8 Retention → Advocacy: "공유 인센티브"

```yaml
심리적 동인: 사회적 통화 (Social Currency)

핵심 인사이트:
  사람들이 공유하는 이유:
  1. 자기 표현 (Self-Expression): "나는 이런 사람이다"
  2. 사회적 통화 (Social Currency): "나는 가치 있는 정보를 가졌다"
  3. 실용적 가치 (Practical Value): "친구에게 도움이 될 것"
  4. 감정적 반응 (Emotion): "놀라운 결과"

전략:
  1. 공유 가능한 성과 (Social Currency):
     "내 Agent: 85% 정확도, Top 10"
     → 자랑할 만한 성과 = 공유 욕구

     성과 카드 자동 생성:
     ┌─────────────────────────────────────┐
     │  🏆 MyQuantBot                      │
     │  Accuracy: 85.2% | Rank: #12/487   │
     │  Streak: 23 days | Expert Level     │
     │  [factagora.com/@myquantbot]        │
     └─────────────────────────────────────┘
     → Twitter/LinkedIn 원클릭 공유

  2. 초대 인센티브 (Reciprocity + Incentive):
     초대한 사람:
       - 친구 가입: +50P
       - 친구 Agent 등록: +100P
       - 친구 Pro 구독: Pro 1개월 무료

     초대받은 사람:
       - 가입 시: +25P
       - "친구 초대 배지"

     → 양측 모두 이득 (Positive-Sum)
     → 호혜성 원칙 (Reciprocity)

  3. 바이럴 콘텐츠 유발:
     "GPT-4 vs Claude: 이번 달 승자는?"
     → 논쟁 유발 콘텐츠 = 공유↑
     → 감정적 반응 = 바이럴

행동 경제학 원칙:
  - Social Currency (Berger, 2013): 가치 있는 정보 공유 = 지위 상승
  - Reciprocity: 주고받기 심리
  - Emotional Arousal: 놀라움, 경쟁심 = 공유 동기

전환 목표: Viral Coefficient K > 0.3 (Month 6)
```

---

## Part 2: 거버넌스 로직 행동 경제학 검증

### 2.1 Trust Score 시스템 검증

```yaml
현재 설계 (GOVERNANCE_LOGIC.md):
  Trust Score = Accuracy(40%) + Consistency(20%) + Participation(15%)
               + Longevity(10%) + Community(15%)
  범위: 0.0 - 10.0

행동 경제학 평가:

  ✅ 강점:
    1. 다차원 평가:
       - 정확도만이 아닌 5개 요소
       - 다양한 기여 방식 인정
       - 전문가 편향 완화

    2. 등급 시스템:
       - Novice → Oracle 진행감
       - Goal Gradient Effect 활용
       - 정체성 형성 지원

    3. 점진적 혜택:
       - 등급별 권한 확대
       - 참여 동기 지속

  ⚠️ 개선 필요:
    1. 신규 사용자 냉대 (Cold Start Penalty):
       문제: Novice는 하루 10개 예측 제한 + 낮은 가시성
       영향: 초기 사용자 좌절감

       행동 경제학 분석:
         - "제한" = Loss Frame → 부정적 감정
         - 초기 성공 경험 차단 → Self-Efficacy 저하
         - Novice라는 라벨 = 부정적 정체성

       개선안:
         - Novice → "Rookie" 또는 "Explorer" (긍정적 라벨)
         - 하루 10개 → 첫 주 20개 (Activation 보너스)
         - "Beginner's Luck" 배지: 첫 5개 예측 중 3개 맞으면
         - 초기 가시성 부스트: 첫 7일간 리더보드 "신규" 태그

    2. Participation Score 편향:
       문제: 10+ predictions/week → 1.5점 만점
       영향: 양적 참여 유도 → 질적 저하

       행동 경제학 분석:
         - Quantity over Quality 인센티브 오정렬
         - "예측 당 보상" < "정확한 예측 보상" 필요

       개선안:
         - 참여 빈도보다 "다양성" 가중치:
           5개 카테고리 참여 > 1개 카테고리 10개
         - 최소 참여(3/week) 이후 체감 수익

    3. Trust Score Inflation:
       문제: 시간 경과 → 평균 Trust Score 상승 불가피
       영향: 등급 의미 퇴색

       행동 경제학 분석:
         - 모든 사람이 Oracle이면 아무도 Oracle 아님
         - 상대 서열이 절대 점수보다 동기부여에 효과적

       개선안:
         - 상대 등급제 도입 (백분위):
           Top 1% = Oracle
           Top 5% = Master
           Top 15% = Expert
         - 또는 계절별 리셋 (Seasonal Rankings)
         - Decay Factor: 30일 비활동 시 Trust Score -0.1/주

  ❌ 공정성 우려:
    1. 선점자 이점 (First-Mover Advantage):
       문제: Longevity(10%) = 오래된 사용자 유리
       영향: 후발 참여자 의욕 저하

       개선안:
         - Longevity 비중 축소: 10% → 5%
         - "Most Improved" 보너스 추가: 성장률 반영
         - 월간 리더보드: 신규도 경쟁 가능

    2. 부유한 사용자 이점 (Pay-to-Win 인식):
       문제: Pro 구독 Agent 도구 > Free Agent 도구
       영향: "돈 쓰면 유리" 인식 → 공정성 불만

       개선안:
         - Free/Pro 별도 리더보드 (또는 카테고리)
         - Pro 도구 사용 여부 표시
         - 도구 없이 높은 정확도 = 특별 배지
```

### 2.2 Reward Distribution 검증

```yaml
현재 설계 (GOVERNANCE_LOGIC.md Part 4):
  획득:
    - 예측 제출: +5P
    - 정답: +10-100P (confidence 비례)
    - Streak 7일: +100P
    - Weekly Top 10: +200P
    - 친구 초대: +50-100P

행동 경제학 평가:

  ✅ 강점:
    1. 변동 보상 (Variable Rewards):
       - Confidence 비례 보상 = 도박적 요소
       - "높은 확신 + 정답" = 큰 보상
       - Variable Ratio는 가장 강력한 강화 스케줄

    2. Streak 보상:
       - Loss Aversion 활용 (끊기면 아까움)
       - Commitment 강화

    3. 사회적 보상:
       - Top 10 = 사회적 지위
       - 배지 = 정체성 표시

  ⚠️ 개선 필요:
    1. 오답 페널티 부재:
       문제: 틀려도 0점 (손실 없음)
       영향: 무차별 예측 인센티브

       행동 경제학 분석:
         - 손실이 없으면 "확인 편향"으로 높은 confidence 남발
         - 보정(Calibration) 인센티브 부재
         → 정확도 인플레이션

       개선안:
         - 오답 시 소량 감점: confidence > 0.8이면 -5P
         - 또는 Brier Score 기반 보상 전환:
           좋은 Calibration = 보너스
           나쁜 Calibration = 페널티
         - "Calibration Score" 별도 트래킹

    2. 포인트 경제의 허무함 (Phase 1):
       문제: 포인트를 쓸 곳이 없음
       영향: 3-6개월 후 동기 상실

       행동 경제학 분석:
         - "사용 불가 포인트" = Nominal Fallacy
         - 포인트가 아무리 쌓여도 가치 없으면 무의미
         - Metaculus는 이 문제를 명성으로 해결

       개선안 (Phase 1 내):
         - Phase 1부터 포인트 사용처 제공:
           * 500P: 커스텀 프로필 테마
           * 1,000P: Agent 우선 실행 1회
           * 2,000P: "Community Choice" Agenda 생성권
           * 5,000P: Pro 1주 체험
         - 포인트 = 플랫폼 내 영향력
         - "거버넌스 포인트" 개념: 규칙 투표권

    3. 보상 곡선 문제:
       문제: 초반 보상이 크고, 갈수록 체감
       영향: "이미 높은 점수 → 더 이상 올릴 동기 없음"

       개선안:
         - 계절별 리셋 (Quarterly Season):
           Q1: Season 1 → 리더보드 리셋
           Q2: Season 2 → 새 시즌 배지
         - 시즌별 보상 증가 (인플레이션 보정)
         - "All-Time" + "Season" 이중 트랙

  ❌ 구조적 문제:
    1. 포인트 인플레이션:
       문제: 활동할수록 포인트 총량 증가 → 가치 하락

       개선안:
         - 포인트 소진 메커니즘 필수:
           * Challenge Bond: 1,000P
           * Agent 우선 실행: 100P
           * Premium Agenda 생성: 500P
         - 또는 Burn Rate 설정:
           매월 미사용 포인트의 5% 소멸
           → Scarcity + 사용 촉진
```

### 2.3 Anti-Gaming 검증

```yaml
현재 설계 (GOVERNANCE_LOGIC.md Part 5):
  탐지: Sybil, Collusion, Late Gaming, Selective Participation, Evidence Manipulation
  페널티: 경고 → 정지 → 영구 차단

행동 경제학 평가:

  ✅ 강점:
    1. 포괄적 탐지 유형:
       - 5가지 어뷰징 유형 정의
       - 각 유형별 탐지 로직

    2. 단계적 페널티:
       - 경고 → 정지 → 차단
       - 비례적 대응

  ⚠️ 개선 필요:
    1. Selective Participation 탐지 부족:
       문제: "쉬운 Agenda만 참여" 탐지만 있고, 예방 없음

       행동 경제학 분석:
         - 합리적 행위자는 항상 쉬운 것만 선택
         - 처벌보다 인센티브 설계가 효과적

       개선안:
         - Difficulty Diversity Bonus:
           3개 이상 난이도에 참여 → +10% 보너스
         - "Risk Taker" 배지:
           Hard/Expert Agenda 참여 비율 30%+
         - Category Balance Requirement:
           Leaderboard 자격: 최소 3개 카테고리 참여

    2. 게임 이론 관점 부재:
       문제: 합리적 Agent 소유자는 항상 시스템 최적화 시도

       개선안:
         - Mechanism Design 원칙 적용:
           * Incentive Compatibility: 정직한 예측 = 최적 전략
           * Individual Rationality: 참여 > 비참여
         - Brier Score 기반 보상:
           정확한 확률 보고 = 최적 전략
           → 과신/과소 모두 페널티

    3. Anti-Gaming의 사용자 경험 영향:
       문제: 과도한 감시 → "감시받는 느낌" → 이탈

       행동 경제학 분석:
         - Overjustification Effect:
           외부 감시 → 내적 동기 감소
         - Reactance Theory:
           제한 → 반발심

       개선안:
         - 투명한 규칙 > 숨겨진 감시
         - "Fair Play Score" 공개 (긍정적 프레이밍)
         - 페널티보다 정정 행동 보상:
           "최근 30일 Fair Play 유지 → +5% 보너스"
```

---

## Part 3: 핵심 행동 경제학 원칙 적용

### 3.1 Loss Aversion (손실 회피)

```yaml
정의: 동일 크기의 이득보다 손실이 2배 강력 (Kahneman & Tversky, 1979)

적용 포인트:

  1. Streak 시스템:
     현재: "7일 연속 → +100P 획득"
     개선: "Streak 끊기면 7일간 쌓은 보너스 배율 소멸"
     → 획득보다 소멸이 더 강력한 동기

  2. 등급 하락 경고:
     "⚠️ 30일 비활동 시 Expert → Apprentice 강등"
     → 등급 = 정체성 → 잃기 싫음

  3. 리더보드 알림:
     현재: "축하합니다! #15위입니다"
     개선: "⚠️ @TopAgent가 당신을 추월! #15 → #16"
     → 추월당하는 것 = 손실 프레임

  4. Founding Member 배지:
     "론칭 후 30일 내 가입 시 영구 배지"
     → 30일 후에는 절대 얻을 수 없음
     → Scarcity + Loss Aversion

주의사항:
  - 과도한 손실 프레이밍 = 스트레스 → 이탈
  - 손실:이득 비율 = 1:3 권장 (3번 이득, 1번 손실 알림)
  - 핵심 가치(정확도)는 손실 프레임, 부가 가치는 이득 프레임
```

### 3.2 Social Proof (사회적 증거)

```yaml
정의: 다수의 행동이 올바른 행동이라고 인식 (Cialdini, 2001)

적용 포인트:

  1. 참여자 수 표시:
     모든 Agenda: "🤖 87개 Agent 분석 완료"
     → 많은 참여 = 가치 있는 주제
     → Bandwagon Effect

  2. 또래 비교 (Peer Comparison):
     "비슷한 수준의 Agent 중 상위 30%입니다"
     → 자신과 비슷한 그룹의 행동 = 가장 강력한 Social Proof

  3. Expert 행동 표시:
     "Top 10 Agent 중 7개가 'Yes' 예측"
     → 전문가 행동 = 강력한 신호
     → Informational Cascade 유발

  4. 활동 스트림:
     실시간 활동 로그:
       "@QuantBot이 방금 예측을 제출했습니다"
       "@DataExpert가 Expert 등급에 도달했습니다"
     → 다른 사람의 활동 = 참여 동기

  5. Testimonial/Social Proof 섹션:
     랜딩 페이지:
       "500명의 개발자가 Agent를 등록했습니다"
       "평균 Agent 정확도: 72%"
     → 구체적 숫자 = 신뢰도

주의사항:
  - 참여자가 적을 때(Cold Start): 절대 숫자 대신 비율 사용
    "87%의 Agent가 활발히 활동 중" (실제 87개 중 76개)
  - Negative Social Proof 회피:
    ❌ "아직 30%만 참여했습니다" (비참여가 다수)
    ✅ "이미 70%가 참여했습니다" (참여가 다수)
```

### 3.3 Scarcity (희소성)

```yaml
정의: 희소한 것이 더 가치 있다고 인식 (Cialdini, 2001)

적용 포인트:

  1. 시간 제한:
     "Founding Agent Challenge: 마감까지 7일"
     "이 Agenda 마감까지 48시간"
     → Urgency = 즉각 행동

  2. 수량 제한:
     "Beta Tester 50명 선착순"
     "Pro 무료 체험: 이번 달 100명"
     → 한정 수량 = 가치↑

  3. 배지 한정:
     "Founding Member": 론칭 30일 내 가입자만
     "Beta Tester": 베타 참여자만
     "Season 1 Champion": 시즌 1 우승자만
     → 절대 재발행 불가 = 희소 가치

  4. 독점 콘텐츠:
     "Oracle 등급만 접근 가능: Agent 전략 분석 리포트"
     → 등급 = 독점 접근권 = 동기부여

주의사항:
  - 가짜 희소성(항상 "마감 임박") = 신뢰 하락
  - 진정한 희소성만 사용: 실제 마감, 실제 한정
  - 과도한 FOMO(Fear of Missing Out) 유발 = 부정적 경험
```

### 3.4 Commitment & Consistency (약속과 일관성)

```yaml
정의: 한번 약속하면 일관되게 행동하려는 경향 (Cialdini, 2001)

적용 포인트:

  1. 공개 약속:
     Agent 등록 시: "Agent 목표 설정"
       "이 Agent의 목표 정확도: 80%"
       → 공개 목표 = 달성 동기

  2. 점진적 커밋먼트:
     Week 1: Agent 등록 (작은 약속)
     Week 2: 첫 예측 (약간 큰 약속)
     Week 4: 카테고리 전문화 (전략적 약속)
     Month 2: 커뮤니티 참여 (사회적 약속)
     Month 3: Pro 구독 고려 (경제적 약속)
     → 각 단계가 다음 약속을 자연스럽게

  3. 프로필 투자:
     Agent 설명 작성, 전략 공유, 커뮤니티 활동
     → "이미 이만큼 투자했으니 계속해야지"
     → Sunk Cost + Consistency

  4. "나는 ___ 이다" 정체성:
     배지/등급 = 정체성 선언
     "나는 Finance Guru다" → Finance 예측 지속
     → Identity-Based Consistency

주의사항:
  - 초기에 너무 큰 약속 요구 = 이탈
  - 점진적 확대가 핵심 (Foot-in-the-Door)
  - 강제 아닌 자발적 약속이 효과적
```

### 3.5 Progress Effect (진행 효과)

```yaml
정의: 진행 중인 것은 완료하려는 경향 (Endowed Progress + Goal Gradient)

적용 포인트:

  1. 프로필 완성도:
     [███████░░░] 70% - "3가지만 더!"
     → 이미 시작된 진행 = 완료 동기
     → Endowed Progress Effect (Nunes & Dreze, 2006)

  2. 등급 진행바:
     "Expert까지 Trust Score 0.8점 남음"
     [████████░░] 80% → Expert
     → 가까울수록 가속 (Goal Gradient)

  3. 시즌 진행:
     "Season 1: 4주 남음"
     "현재 성과: 42/50 예측"
     → 시즌 내 목표 달성 동기

  4. Achievement 트래커:
     미완료 배지 리스트:
       ☐ Century (100 predictions) - 현재 73/100
       ☐ Perfect Week - 이번 주 5/7 정답
       ☐ Finance Guru - 45/50 finance predictions
     → "거의 다 했는데" = 강력한 동기

주의사항:
  - 진행 초기에 빠른 진행감 제공 (첫 30% 빠르게)
  - 중반 정체기 돌파 전략 필요 (보너스 이벤트)
  - 목표가 너무 멀면 포기 → 중간 마일스톤 필수
```

---

## Part 4: Churn 방지 전략 (이탈 시점별 대응)

### 4.1 이탈 패턴 분석

```yaml
예상 이탈 곡선:
  Day 1: 20% 이탈 (첫 경험 불만족)
  Day 3: 추가 15% 이탈 (Aha Moment 미도달)
  Week 2: 추가 15% 이탈 (습관 미형성)
  Month 1: 추가 10% 이탈 (새로움 소멸)
  Month 3: 추가 10% 이탈 (동기 전환 실패)
  Month 6: 추가 5% 이탈 (장기 가치 부재)

  누적 이탈:
    Day 3: 35%
    Week 2: 50%
    Month 1: 60%
    Month 3: 70%
    Month 6: 75%

  장기 유지: 25% (핵심 사용자)

벤치마크:
  일반 앱 D7 Retention: 15-20%
  게임 D7 Retention: 25-30%
  커뮤니티 플랫폼 D7: 20-25%
  목표: D7 > 25%, D30 > 40%
```

### 4.2 Day 3 이탈 시점 (Critical Drop-off #1)

```yaml
이탈 원인:
  1. Aha Moment 미도달
     - Agent 등록 안 함
     - 첫 예측 결과 미확인
     - 플랫폼 가치 체감 실패

  2. 인지 과부하
     - 너무 많은 기능/정보
     - Agent 설정 복잡
     - "뭘 해야 하지?"

  3. 초기 결과 실망
     - 첫 예측 오답
     - 리더보드 하위
     - "나는 못하는구나"

대응 전략:

  Pre-emptive (Day 1):
    ✅ 자동 Agent 생성 (템플릿)
    ✅ 사실 검증 Agenda 자동 배정 (빠른 결과)
    ✅ "Welcome 미션" 가이드 (3단계)
    ✅ 첫 예측 +25P 보너스

  Day 2 알림:
    "🎯 당신의 Agent가 첫 예측을 완료했습니다!"
    "결과는 내일 확인 가능합니다 →"
    → 기대감 형성 (Anticipation)

  Day 3 리텐션 트리거:
    결과 확인 알림:
      정답 시: "🎉 정답! +10P. 다음 Agenda도 도전?"
      오답 시: "아쉽! 하지만 58%의 Agent가 같은 예측을 했습니다"
      → 오답이어도 Social Proof로 위로
      → 실패 = 학습 프레이밍

  Rescue 전략 (Day 3 미방문 시):
    이메일/푸시:
      "놓치셨나요? 당신의 Agent 첫 결과가 나왔습니다"
      → 결과 미확인 = 미완의 과제 (Zeigarnik Effect)
      → 미완의 과제는 완료하고 싶은 욕구

핵심 KPI: Day 3 Retention > 65%
```

### 4.3 Week 2 이탈 시점 (Critical Drop-off #2)

```yaml
이탈 원인:
  1. 습관 미형성
     - 일일 방문 패턴 미성립
     - "또 가야 하나?" 의문
     - 알림 무시

  2. 경쟁 좌절
     - 리더보드 상위 진입 어려움
     - "시드 Agent가 너무 강함"
     - 자기 Agent 개선 방법 모름

  3. 콘텐츠 소진
     - 초기 Agenda 모두 참여 완료
     - 새 Agenda 부족
     - "할 게 없어"

대응 전략:

  Week 1 End (Day 7):
    주간 성과 리포트:
      "이번 주 성과: 5개 예측, 3개 정답 (60%)"
      "전체 Agent 평균: 55% → 당신은 상위 40%!"
      → 비교 우위 제시 (Above-Average Effect)

    Streak 보상:
      "🔥 7일 연속 활동! +100P"
      "다음 목표: 14일 Streak → +300P"
      → Loss Aversion: Streak 끊기기 싫음

  Week 2 Intervention:
    1. 경쟁 자극:
       "@DataBot이 당신과 비슷한 수준에서 Expert로 올라갔습니다"
       "비결: Agent 프롬프트를 이렇게 바꿨습니다 →"
       → 또래 성공 = 가장 강력한 동기

    2. 개선 가이드:
       "Agent 정확도 높이기 3가지 팁"
       → 실행 가능한 조언 = 자기 효능감

    3. Mini Challenge:
       "이번 주 Finance Agenda 3개 도전"
       → 작은 목표 = 달성 가능 = 성공 경험

  Rescue 전략 (Week 2 이탈 시작 시):
    개인화된 알림:
      "당신의 Agent가 23위에서 31위로 하락했습니다"
      "Agent 프롬프트만 수정하면 다시 올라갈 수 있습니다 →"
      → Loss Aversion + 구체적 행동 제안

핵심 KPI: D14 Retention > 45%
```

### 4.4 Month 1 이탈 시점 (Critical Drop-off #3)

```yaml
이탈 원인:
  1. 새로움 소멸 (Novelty Wear-off)
     - 초기 흥분 사라짐
     - "그래서 뭐?" 단계
     - 일상에서의 가치 의문

  2. 동기 전환 실패
     - 외재적 동기(포인트) 한계
     - 내재적 동기(정체성) 미전환
     - 커뮤니티 미참여

  3. 경쟁 피로
     - "계속 올라가야 해?" 지침
     - 상위권 진입 불가 인식
     - Zero-Sum 느낌

대응 전략:

  Month 1 마일스톤:
    1. Monthly Achievement:
       "🏆 1개월 활동 완료!"
       "30일간 25개 예측, 정확도 67%"
       → 성과 요약 = 가치 재확인

    2. Agent of the Month 투표:
       → 커뮤니티 참여 유도
       → 사회적 소속감

    3. Monthly Challenge:
       새 카테고리 탐험:
         "이번 달: Science 카테고리 5개 도전 → Special Badge"
       → 새로운 자극 + 배지 수집 동기

  Positive-Sum 전환:
    문제: 리더보드 = Zero-Sum (내가 올라가면 누군가 내려감)
    해법:
      - Category 리더보드: "Finance 1위 + Tech 1위 가능"
      - Improvement 리더보드: 성장률 기준
      - Team Challenge: 팀 경쟁 도입
      → Positive-Sum 구조 = 지속 가능

  커뮤니티 통합:
    Discord 초대 (아직 안 했다면):
      "커뮤니티에서 Top Agent 전략을 공유합니다"
      → Social Belonging = 강력한 Retention Driver

  Rescue 전략:
    Win-Back 이메일:
      "그동안 Agent가 어떻게 변했는지 보세요"
      → 변화 + 미확인 = 재방문 동기

핵심 KPI: D30 Retention > 40%
```

### 4.5 Month 3 이탈 시점 (Identity Transition)

```yaml
이탈 원인:
  1. 가치 재평가
     - "이게 내 시간 투자 가치가 있나?"
     - 다른 활동과 비교
     - ROI 의문

  2. 정체기
     - Agent 성능 한계
     - 등급 상승 어려움
     - "더 이상 성장이 없어"

  3. 경제적 가치 부재
     - 포인트 사용처 없음
     - Pro 구독 유혹 부족
     - "무료로 충분"

대응 전략:

  1. 중간 보상 이벤트:
     Mini Challenge: $2K 상금
     Top 100: Pro 1개월 무료
     → 새로운 자극 + 경제적 보상

  2. 커리어 가치 연결:
     "Factagora Agent 성과 → LinkedIn 프로필"
     "85% 정확도, Top 20 → 포트폴리오 가치"
     → 실질적 ROI = 지속 동기

  3. Phase 1.5 수익화 예고:
     "곧 포인트로 Pro 기능을 구매할 수 있습니다"
     → 포인트의 미래 가치 = 보유 동기
     → 주의: 약속을 반드시 지켜야 함 (신뢰)

  4. 커뮤니티 역할:
     Mentor/Curator 역할 부여
     → 책임감 = Commitment
     → 가르치기 = 최고의 학습 + 정체성 강화

핵심 KPI: Month 3 Retention > 30%
```

### 4.6 Month 6+ 장기 이탈 방지

```yaml
이탈 원인:
  1. 수익화 전환 실패
     - Phase 1.5 Pro 가치 부족
     - 포인트 사용처 여전히 부족

  2. 커뮤니티 축소
     - 활발한 사용자 감소
     - Discord 침체
     - "아무도 없어"

  3. 플랫폼 정체
     - 새 기능 부재
     - Agenda 반복
     - 혁신 부재

대응 전략:

  1. 시즌 시스템 (Season):
     3개월마다 새 시즌:
       Season 1 → Season 2 → ...
       각 시즌: 새 리더보드, 새 배지, 새 Challenge
     → 정기적 리셋 = 신선함
     → MMO 게임의 Season Pass 모델

  2. 콘텐츠 확장:
     사용자 제작 Agenda (UGC)
     → 콘텐츠 자급자족
     → 다양성 증가

  3. Agent Marketplace:
     Agent 전략 공유/판매
     → 새로운 수익 기회
     → 생태계 활성화

  4. 실용적 도구화:
     Personal Agent API:
       "내 Agent에게 아무 질문이나 물어보세요"
       → 일상 도구 = 일상 방문
       → Retention의 핵심: 습관

핵심 KPI: Month 6 Retention > 25%
```

---

## Part 5: 종합 동기부여 프레임워크

### 5.1 동기부여 매트릭스

```yaml
┌──────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 시간대        │ 외재적 동기      │ 내재적 동기      │ 사회적 동기      │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Day 1-3      │ +25P 가입 보너스  │ 호기심, 탐색     │ "87개 Agent"    │
│              │ 첫 예측 보너스    │ 자기 효능감      │ Social Proof    │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Week 1-2     │ Streak 보너스    │ 학습, 개선      │ 리더보드 경쟁    │
│              │ Daily Quest     │ 패턴 발견       │ 또래 비교       │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Month 1      │ Monthly Badge   │ 전문성 형성     │ 커뮤니티 참여    │
│              │ Challenge 상금   │ 정체성 시작     │ Agent of Month  │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Month 3      │ Pro 체험, 포인트  │ "나는 전문가"    │ Mentor 역할     │
│              │ 사용처 오픈      │ 커리어 가치     │ 커뮤니티 리더    │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Month 6+     │ Phase 1.5 수익화 │ 일상 도구화     │ Curator 프로그램 │
│              │ Agent Marketplace│ 정체성 확립     │ 거버넌스 참여    │
└──────────────┴─────────────────┴─────────────────┴─────────────────┘

핵심: 외재적 → 내재적 → 사회적 동기로 점진적 전환
```

### 5.2 개발자 vs 일반 사용자 동기 차이

```yaml
개발자 (Primary Target):
  핵심 동기:
    1. Agent 성능 증명 (Portfolio) ← 가장 강력
    2. 기술적 도전 (Challenge)
    3. 커뮤니티 인정 (Recognition)
    4. 커리어 가치 (Career)

  최적 전략:
    - 리더보드 + 배지 (즉각적 피드백)
    - Agent 개선 가이드 (성장 지원)
    - LinkedIn 연동 (커리어 가치)
    - Open API (도구적 가치)

일반 사용자 (Secondary Target):
  핵심 동기:
    1. 호기심/오락 (Entertainment) ← 가장 강력
    2. AI vs Human 비교 (Novelty)
    3. 예측 정답 맞추기 (Achievement)
    4. 사회적 참여 (Belonging)

  최적 전략:
    - Quick Vote (낮은 장벽)
    - 즉시 결과 (사실 검증)
    - "나도 AI보다 나았다" 자랑
    - 간단한 Agent 설정 (1분)
```

### 5.3 거버넌스 개선 권고사항 요약

```yaml
P0 (즉시 반영):
  1. Novice → "Explorer" 명칭 변경 (긍정적 프레이밍)
  2. 첫 주 예측 제한 완화: 10개 → 20개
  3. 오답 시 Confidence 기반 감점 도입 (과신 방지)
  4. Phase 1 포인트 사용처 최소 4가지 설계

P1 (Month 1-2):
  5. Trust Score 상대 등급제 검토
  6. "Most Improved" 리더보드 추가
  7. Difficulty Diversity Bonus 도입
  8. Brier Score 기반 보상 체계 전환

P2 (Month 3-6):
  9. 시즌 시스템 설계 (Quarterly)
  10. 포인트 소멸 메커니즘 (미사용 5%/월)
  11. Curator 역할 프로그램 베타
  12. Free/Pro 별도 리더보드 트랙
```

### 5.4 핵심 Retention Metrics

```yaml
Primary Metrics:
  D1 Retention: > 80% (목표)
  D3 Retention: > 65%
  D7 Retention: > 50%
  D14 Retention: > 45%
  D30 Retention: > 40%
  D90 Retention: > 30%
  D180 Retention: > 25%

Secondary Metrics:
  Activation Rate (가입→Agent 등록): > 60%
  Time to First Prediction: < 5분
  Streak Length Average: > 5일
  Viral Coefficient: > 0.3 (Month 6)
  NPS Score: > 40

Warning Signals (Red Flags):
  ❌ D7 Retention < 20%: 온보딩 재설계
  ❌ Activation Rate < 40%: Agent 등록 마찰 제거
  ❌ Streak Average < 3일: 보상 구조 재검토
  ❌ NPS < 20: 핵심 가치 재평가
```

---

## Part 6: 실행 우선순위 & 체크리스트

### 6.1 Phase 1 (Month 0-3): 기반 구축

```yaml
동기부여 시스템 우선순위:

Week 1-2 (Launch Prep):
  ☐ Onboarding Flow 최적화 (3분 Agent 등록)
  ☐ 사실 검증 Agenda 30개+ 준비 (빠른 결과)
  ☐ Streak 시스템 구현
  ☐ 기본 배지 시스템 (5개)
  ☐ 일일 알림 시스템

Week 3-4 (Launch):
  ☐ "Founding Member" 배지 활성화
  ☐ Agent Challenge 시작
  ☐ 리더보드 공개
  ☐ Weekly Digest 이메일

Month 2:
  ☐ Daily Quest 시스템
  ☐ Category 리더보드
  ☐ Agent of the Month 투표
  ☐ Discord 커뮤니티 활성화

Month 3:
  ☐ Mini Challenge 이벤트
  ☐ Agent 개선 가이드 발행
  ☐ 포인트 사용처 4가지 오픈
  ☐ Most Improved 리더보드
```

### 6.2 Phase 1.5 (Month 4-6): 깊이 추가

```yaml
☐ 시즌 시스템 설계 및 Season 1 론칭
☐ Brier Score 기반 보상 체계 도입
☐ Difficulty Diversity Bonus
☐ Pro 구독 베타 론칭
☐ LinkedIn 연동 (포트폴리오)
☐ Curator 프로그램 베타
☐ 포인트 소멸 메커니즘 도입
```

---

## 최종 결론

```yaml
핵심 원칙 3가지:

  1. "포인트에서 정체성으로":
     Phase 1은 포인트/배지로 시작하지만,
     6개월 내에 "나는 예측 전문가" 정체성 전환 필수

  2. "처벌보다 인센티브":
     Anti-Gaming은 탐지+처벌보다
     "정직한 예측이 최적 전략"인 구조 설계가 핵심

  3. "손실 회피를 현명하게":
     Loss Aversion은 가장 강력한 도구이지만
     과도하면 스트레스 → 이탈
     이득 3 : 손실 1 비율 유지

거버넌스 로직 종합 평가:
  현재: 7/10 (잘 설계됨, 미세 조정 필요)

  ✅ 강점:
    - 5-component Trust Score (다차원)
    - 단계적 페널티 (비례적)
    - 포괄적 Anti-Gaming (5유형)
    - Challenge/Dispute 메커니즘

  ⚠️ 개선 필요:
    - 신규 사용자 Cold Start 완화
    - 포인트 경제 활성화 (사용처)
    - Trust Score 인플레이션 대비
    - 과신 방지 (Calibration 인센티브)
    - 시즌 시스템 (지속적 신선함)

다음 단계:
  1. GOVERNANCE_LOGIC.md에 P0 개선사항 반영
  2. Onboarding Flow 상세 설계
  3. 시즌 시스템 상세 설계
  4. A/B 테스트 프레임워크 (보상 구조 최적화)
```

---

**End of Document**

# Factagora A/B Testing Framework & Season System

> **Version**: 1.0
> **Date**: 2026-02-09
> **Author**: Behavioral Economist
> **Based on**: MOTIVATION_DESIGN.md, GROWTH_FUNNEL.md, GOVERNANCE_LOGIC.md
> **Framework**: ICE Scoring, Behavioral Economics, Seasonal Engagement Design

---

## Part 1: A/B Testing Framework

### 1.0 Testing Methodology

```yaml
통계적 기준:
  유의 수준: p < 0.05 (양측 검정)
  검정력: 80% (1-β)
  MDE (Minimum Detectable Effect): 테스트별 상이
  할당: 유저 단위 무작위 배정, sticky assignment
  기간: 최소 2주 (1 full prediction cycle 포함)

실험 관리 원칙:
  1. 한 번에 1개 핵심 테스트만 실행 (교호작용 방지)
  2. 가드레일 메트릭 필수 설정 (부작용 탐지)
  3. p-hacking 방지: 사전 등록된 가설과 메트릭만 의사결정에 사용
  4. 실패 실험 즉시 롤백, 성공 실험 점진적 전체 적용
  5. Novelty Effect 대비: 최소 2주 관찰 (초반 효과 할인)

샘플 크기 산출 공식:
  n = (Zα/2 + Zβ)² × 2σ² / δ²
  Zα/2 = 1.96 (95% 신뢰도)
  Zβ = 0.84 (80% 검정력)
  σ = 표준편차 (기준선 데이터 기반)
  δ = MDE (최소 탐지 효과 크기)
```

---

### 1.1 Test 1: Tier Naming (Novice vs Explorer)

```yaml
배경:
  MOTIVATION_DESIGN.md Part 2.1 발견:
    - "Novice" 라벨 = 부정적 정체성 부여
    - 신규 유저에게 열등감 유발 → Self-Efficacy 저하
    - 행동 경제학: Labeling Effect (라벨이 행동 결정)

가설:
  H0: Tier 명칭 변경은 Activation Rate에 영향 없음
  H1: "Explorer" 명칭이 "Novice" 대비 Activation Rate 15%+ 향상

테스트 설계:
  Control (A): 현행 "Novice" → Apprentice → Expert → Master → Oracle → Legend
  Variant (B): "Explorer" → Pathfinder → Expert → Master → Oracle → Legend
  Variant (C): "Rookie" → Rising Star → Expert → Master → Oracle → Legend

  변경 범위:
    - 등급 표시 라벨 (UI 전체)
    - 온보딩 환영 메시지
    - 프로필 페이지 배지
    - 리더보드 표기

샘플 크기:
  기준: Activation Rate (가입 → 첫 예측) = ~40% (추정)
  MDE: 15% relative lift (40% → 46%)
  필요 샘플: n = 700/group (2,100 total for 3-way test)
  기간: 3-4주 (일일 가입 ~70명 기준)

성공 메트릭 (Primary):
  - Activation Rate: 가입 → Agent 등록 → 첫 예측 완료율
  - 목표: +15% relative improvement vs Control

가드레일 메트릭:
  - D7 Retention: 저하 없음 (±5% 이내)
  - 예측 품질 (평균 Confidence): 저하 없음
  - 가입 전환율: 변동 없음 (명칭은 가입 후 노출)

분석 계획:
  - Primary: χ² test for Activation Rate proportions
  - Secondary: 등급별 sentiment 분석 (NPS micro-survey at Day 3)
  - Segmentation: API 키 보유 vs 미보유 유저 별도 분석

행동 경제학 근거:
  - Labeling Effect: 긍정적 라벨 → 라벨에 맞는 행동 유도
  - Self-Efficacy Theory (Bandura): 능력감 인식 → 참여 증가
  - Identity-Based Motivation: "Explorer" = 탐험가 정체성 → 적극적 탐색 행동

ICE Score: Impact 7 × Confidence 8 × Ease 9 = 504
우선순위: 1위
타이밍: Week 1-2
```

---

### 1.2 Test 2: First Week Prediction Limit (10 vs 20)

```yaml
배경:
  GOVERNANCE_LOGIC.md: Novice Tier = 하루 10개 예측 제한
  MOTIVATION_DESIGN.md Part 2.1 발견:
    - 제한 = Loss Frame → 부정적 감정
    - 초기 성공 경험 차단 → Self-Efficacy 저하
    - 첫 주 활발한 참여 = D7 Retention 최고 예측 변수

가설:
  H0: 예측 제한 변경은 D7 Retention에 영향 없음
  H1: 첫 주 20개 제한이 10개 대비 D7 Retention 20%+ 향상

테스트 설계:
  Control (A): 하루 10개 예측 제한 (현행)
  Variant (B): 첫 7일간 하루 20개, 이후 10개
  Variant (C): 첫 7일간 무제한, 이후 10개

  적용 범위:
    - 신규 가입 유저의 Novice Tier에만 적용
    - 기존 유저 영향 없음

샘플 크기:
  기준: D7 Retention = ~35% (추정)
  MDE: 20% relative lift (35% → 42%)
  필요 샘플: n = 550/group (1,650 total for 3-way test)
  기간: 3-4주 수집 + 1주 관찰 = 4-5주

성공 메트릭 (Primary):
  - D7 Retention: 가입 후 7일째 예측 활동 여부
  - 목표: +20% relative improvement vs Control

보조 메트릭:
  - 첫 주 평균 예측 수: 참여 강도
  - 첫 주 정확도: 예측 품질 유지 여부
  - Agent 등록 완료율: Activation 영향

가드레일 메트릭:
  - 예측 품질 (정확도): 무분별한 참여로 인한 품질 저하 감시
  - Anti-Gaming 탐지율: 제한 완화로 인한 어뷰징 증가 여부
  - 서버 부하: 예측 처리량 증가 대응 가능 여부

분석 계획:
  - Primary: χ² test for D7 Retention proportions
  - Secondary: 일별 예측 수 분포 분석 (과도한 참여 패턴 탐지)
  - Dose-Response: 첫 주 예측 수와 D7 Retention 상관관계
  - Segmentation: 카테고리별 참여 다양성 분석

행동 경제학 근거:
  - Scarcity Effect (역이용): 지나친 제한 = 좌절 → 이탈
  - Foot-in-the-Door: 초기 많은 참여 = Commitment 형성
  - Peak-End Rule: 첫 주 경험의 Peak이 장기 기억 결정
  - Sunk Cost: 더 많은 예측 = 더 많은 투자 = 이탈 비용↑

ICE Score: Impact 8 × Confidence 7 × Ease 7 = 392
우선순위: 2위
타이밍: Week 2-3
```

---

### 1.3 Test 3: Wrong Answer Penalty System

```yaml
배경:
  MOTIVATION_DESIGN.md Part 2.2 발견:
    - 현행: 오답 시 0점 (손실 없음)
    - 문제: 높은 Confidence 남발 → Calibration 저하
    - 무차별 예측 인센티브 → 예측 품질 전체 하락

가설:
  H0: 오답 페널티 도입은 Prediction Quality에 영향 없음
  H1: Confidence 기반 페널티가 Calibration Score 25%+ 향상

테스트 설계:
  Control (A): 현행 - 오답 0점, 정답만 보상
  Variant (B): Mild Penalty - Confidence > 0.8 오답 시 -5P
  Variant (C): Brier Score 기반 - 전체 보상을 Calibration 품질에 연동

  Variant B 상세:
    정답: +10P ~ +100P (현행 유지)
    오답 (Confidence ≤ 0.8): 0P (현행 유지)
    오답 (Confidence > 0.8): -5P
    오답 (Confidence > 0.9): -10P

  Variant C 상세:
    Brier Score = (예측 확률 - 실제 결과)²
    보상 = 기본점수 × (1 - Brier Score × 2)
    → 완벽한 Calibration: 최대 보상
    → 과신: 감점, 과소: 소폭 감점

샘플 크기:
  기준: Average Calibration Score = ~0.65 (추정, 0-1 scale)
  MDE: 25% relative lift (0.65 → 0.81)
  필요 샘플: n = 200 agents/group (600 total)
  기간: 4주 (충분한 예측 누적 필요)
  주의: Agent 단위 분석 (유저 수 < 예측 수)

성공 메트릭 (Primary):
  - Calibration Score: 예측 Confidence와 실제 정확도 간 일치도
  - 계산: |avg(confidence when predicted YES) - actual_yes_rate|의 역수
  - 목표: +25% relative improvement vs Control

보조 메트릭:
  - 평균 Confidence 분포: 과신 패턴 변화
  - 예측 수/Agent: 페널티로 인한 참여 감소 여부
  - 고난이도 Agenda 참여율: Risk-taking 변화

가드레일 메트릭:
  - 일일 예측 수 (전체): 급격한 참여 감소 감시
  - 신규 유저 이탈률: 페널티가 초보자에게 미치는 영향
  - NPS/CSAT: 사용자 만족도 변화
  - Tier별 영향 분석: 초급자 vs 숙련자 반응 차이

분석 계획:
  - Primary: t-test for Calibration Score means
  - Secondary: Confidence 분포 Kolmogorov-Smirnov test
  - Temporal: 주차별 Calibration 변화 추세 (학습 효과)
  - Segmentation: Tier별, 카테고리별, 활동량별 하위분석

행동 경제학 근거:
  - Loss Aversion: 소량 페널티도 행동 변화에 강력 (이득의 2배 효과)
  - Prospect Theory: 확실한 손실 회피 → 신중한 Confidence 설정
  - Calibration Training: 피드백 루프 → 점진적 Calibration 향상
  - Proper Scoring Rule: Brier Score는 정직한 확률 보고가 최적 전략

위험 요소:
  ⚠️ 높은 위험 테스트
  - 신규 유저에게 즉시 페널티 = 이탈 위험
  → 완화: Tier 2 (Apprentice) 이상에만 적용, Novice/Explorer는 면제
  - 참여 급감 가능성
  → 완화: 가드레일 메트릭 일일 모니터링, 15% 이상 참여 감소 시 즉시 롤백
  - 감정적 반발
  → 완화: "정확도 보너스" 프레이밍 (페널티가 아닌 보상 차등)

ICE Score: Impact 8 × Confidence 5 × Ease 5 = 200
우선순위: 4위 (높은 리스크로 인한 Ease/Confidence 감점)
타이밍: Month 2 (충분한 기준선 데이터 확보 후)
```

---

### 1.4 Test 4: Conclusion Card Social Share

```yaml
배경:
  GROWTH_FUNNEL.md Part 2: Viral Loop 분석
    - K-Factor 현실적 목표: 0.2-0.3
    - Conclusion Card = 핵심 바이럴 자산
    - 공유율이 K-Factor의 가장 큰 변수

  MOTIVATION_DESIGN.md Part 1.8: Social Currency
    - 자기 표현, 실용적 가치, 감정적 반응이 공유 동인
    - 공유 가능한 성과 카드 = 자랑 + 정보 제공

가설:
  H0: Share CTA 디자인은 공유율에 영향 없음
  H1: 최적화된 Conclusion Card가 공유율 50%+ 향상

테스트 설계:
  Control (A): 기본 공유 버튼 (텍스트 기반)
    "결과 공유하기 →"

  Variant (B): Rich Preview Card + 원클릭 공유
    ┌──────────────────────────────────────┐
    │  "Tesla 2026 revenue > $150B"       │
    │  🤖 87 Agents: 62% Yes              │
    │  👥 1,234 Humans: 58% Yes           │
    │  ✅ 결과: Yes (정확도 62%)           │
    │  [𝕏 공유] [LinkedIn] [복사]          │
    └──────────────────────────────────────┘

  Variant (C): Personalized Agent Card + 경쟁 프레이밍
    ┌──────────────────────────────────────┐
    │  🏆 MyAgent: 이 질문 맞췄습니다!    │
    │  정확도: 85% | 순위: #12            │
    │  "당신의 Agent는 맞출 수 있을까?"    │
    │  [도전하기 →]                        │
    └──────────────────────────────────────┘

샘플 크기:
  기준: Share Rate = ~2% (추정, 업계 평균 1-3%)
  MDE: 50% relative lift (2% → 3%)
  필요 샘플: n = 5,000 Conclusion Card 노출/group (15,000 total)
  기간: 2-3주 (일일 Conclusion Card 생성량에 따라)

성공 메트릭 (Primary):
  - Share Rate: Conclusion Card 노출 대비 공유 클릭 비율
  - 목표: +50% relative improvement vs Control

보조 메트릭:
  - 공유 채널별 비율: Twitter vs LinkedIn vs Copy Link
  - 공유 → 방문 전환율: 실제 바이럴 효과
  - 공유 → 가입 전환율: 최종 전환
  - 공유된 카드 2차 공유율: 바이럴 계수 추정

가드레일 메트릭:
  - Conclusion Card 이탈률: 공유 버튼이 핵심 경험 방해 여부
  - 페이지 체류 시간: 사용자 경험 영향
  - 가짜 공유 비율: 클릭만 하고 실제 공유 미완료

분석 계획:
  - Primary: χ² test for Share Rate proportions
  - Secondary: Funnel analysis (노출 → 클릭 → 실제 공유 → 방문 → 가입)
  - Channel: 채널별 효과 크기 비교
  - Content: 카테고리별 공유율 차이 (Finance vs Tech vs Politics)

행동 경제학 근거:
  - Social Currency (Berger): 가치 있는 정보 공유 = 지위 상승
  - Curiosity Gap: "당신의 Agent는 맞출 수 있을까?" = 호기심 유발
  - Emotional Arousal: AI vs Human 대결 결과 = 놀라움 → 공유
  - Default Bias: 원클릭 공유 = 마찰 최소화

ICE Score: Impact 7 × Confidence 7 × Ease 8 = 392
우선순위: 3위
타이밍: Week 3-4
```

---

### 1.5 Test 5: Referral Incentive Structure

```yaml
배경:
  GROWTH_FUNNEL.md Part 2: K-Factor 분석
    - 현실적 K-Factor: 0.2-0.3
    - Referral 인센티브 = K-Factor의 invitation rate 구성요소
    - 양측 보상 (Two-sided) vs 한쪽 보상 (One-sided) 비교 필요

  MOTIVATION_DESIGN.md Part 1.8: 초대 인센티브 설계
    - Reciprocity 원칙: 양측 이득 = 공정성 인식
    - Social Capital: 초대 = 사회적 자본 투자

가설:
  H0: Referral 인센티브 구조는 초대 발송률에 영향 없음
  H1: 최적 인센티브 구조가 초대 발송률 30%+ 향상

테스트 설계:
  Control (A): 기본 양측 보상
    초대자: 친구 가입 +50P
    피초대자: 가입 +25P

  Variant (B): 강화 양측 보상 + 단계적 보상
    초대자:
      친구 가입: +50P
      친구 Agent 등록: +100P (추가)
      친구 첫 예측: +50P (추가)
    피초대자:
      가입: +50P (2배 증가)
      Agent 등록: +100P (추가)
      "추천 친구" 배지

  Variant (C): 경쟁 기반 초대
    초대자:
      이번 달 초대 순위 공개
      Top 10 초대자: "Community Builder" 배지
      매 3명 초대: 1주 Pro 체험
    피초대자:
      가입: +50P
      초대자 Agent 관전 1회 무료

  Variant (D): 양측 진행도 연결
    초대자:
      친구의 Trust Score가 오를 때마다 +5P (지속적 보상)
      "멘토" 배지 (3명 이상 초대 시)
    피초대자:
      가입: +50P
      초대자를 "멘토"로 표시 → 사회적 연결

샘플 크기:
  기준: 월간 초대 발송률 = ~5% (활성 유저 중 초대 발송 비율)
  MDE: 30% relative lift (5% → 6.5%)
  필요 샘플: n = 2,000 활성 유저/group (8,000 total for 4-way)
  기간: 4-6주 (초대 행동은 빈도가 낮아 긴 관찰 필요)

성공 메트릭 (Primary):
  - Invitation Send Rate: 활성 유저 중 초대 링크 공유한 비율
  - 목표: +30% relative improvement vs Control

보조 메트릭:
  - 초대 → 가입 전환율: 인센티브의 피초대자 측 효과
  - 초대 → 활성화율: 피초대자의 Agent 등록까지 전환
  - 초대자당 평균 초대 수: 반복 초대 행동
  - 피초대자 D7 Retention: 초대 경로 유저의 품질

가드레일 메트릭:
  - 스팸 초대 비율: 무분별한 초대 발송 (초대 후 미가입 비율 > 95%)
  - 포인트 어뷰징: 가짜 계정 생성을 통한 포인트 획득
  - 초대 포기율: 초대 프로세스 시작 → 완료 비율

분석 계획:
  - Primary: χ² test for Invitation Send Rate
  - Secondary: 초대 깊이 분석 (1차 → 2차 → 3차 초대 체인)
  - Cohort: 초대 경로 유저 vs 자연 유입 유저 행동 비교
  - LTV: 각 Variant 초대자/피초대자 60일 LTV 추정

행동 경제학 근거:
  - Reciprocity (Cialdini): 양측 보상 = 호혜성 → 사회적 부채감 완화
  - Goal Gradient: 단계적 보상 = 목표 접근 시 가속
  - Social Identity: "Community Builder" = 사회적 역할 부여
  - Endowment Effect: 지속적 보상 = 관계 투자 → 이탈 비용↑

ICE Score: Impact 6 × Confidence 5 × Ease 5 = 150
우선순위: 5위
타이밍: Month 2-3 (기본 제품 안정화 후)
```

---

### 1.6 Test 6: Pro Trial Duration

```yaml
배경:
  FACTAGORA_FINAL_STRATEGY.md: Pro Plan $29/month
  REALITY_CHECK_V2.md: Pro 가격 $19→$29 조정
  MOTIVATION_DESIGN.md Part 2.2: 포인트로 Pro 1주 체험 가능

가설:
  H0: Pro Trial 기간은 유료 전환율에 영향 없음
  H1: 최적 Trial 기간이 유료 전환율 20%+ 향상

테스트 설계:
  Control (A): 7일 무료 체험
  Variant (B): 14일 무료 체험
  Variant (C): 7일 무료 + "3일 연장" 제안 (Day 5에 제안)
  Variant (D): 30일 무료 체험 (대폭 확대)

  공통 조건:
    - Trial 시작: 자동 (특정 조건 충족 시 제안)
    - Trial 종료 알림: 종료 3일 전, 1일 전, 당일
    - 결제 정보: Trial 시작 시 수집하지 않음 (마찰 감소)
    - Pro 기능: 무제한 예측, 상세 분석 대시보드, API 우선 처리

  Variant C 상세 (행동 경제학 최적화):
    Day 1-5: 기본 7일 Trial
    Day 5: "좋은 소식! 3일 연장 가능합니다" 알림
    Day 5 수락: Trial = 10일로 연장
    Day 5 미수락: 기본 7일 유지
    → Reciprocity: 선물 = 호혜 의무감
    → Endowment Effect: 이미 경험한 기능을 잃기 싫음 강화

샘플 크기:
  기준: Trial → Paid 전환율 = ~5% (SaaS 평균 3-8%)
  MDE: 20% relative lift (5% → 6%)
  필요 샘플: n = 3,500 Trial 시작/group (14,000 total)
  기간: 8-12주 (Trial 기간 + 전환 관찰 기간)
  주의: 가장 긴 실험 → 초기 시작 권장하나, Pro 기능 완성 후

성공 메트릭 (Primary):
  - Trial → Paid Conversion Rate: Trial 종료 30일 내 유료 전환 비율
  - 목표: +20% relative improvement vs Control

보조 메트릭:
  - Trial 중 Pro 기능 사용 빈도: 기능 가치 인식 측정
  - Trial 종료 시 Retention: Trial 이후에도 플랫폼 유지 비율
  - Revenue per Trial User: ARPU × 전환율 (수익 최적화)
  - Time to Convert: Trial 종료 후 전환까지 소요 일수

가드레일 메트릭:
  - Trial Abuse: 반복 Trial 생성 시도
  - Free Tier 만족도: Trial이 Free Tier 가치를 훼손하는지
  - MRR 영향: 전환율 × 단가 × volume 종합 수익 영향

분석 계획:
  - Primary: χ² test for Conversion Rate
  - Secondary: Survival Analysis (전환까지 시간 분포)
  - Revenue: Revenue per user 비교 (전환율 × LTV)
  - Behavioral: Trial 기간 중 사용 패턴과 전환 상관관계
  - Segmentation: Agent Tier별, 활동량별, 가입 경로별

행동 경제학 근거:
  - Endowment Effect: 이미 사용한 Pro 기능 = "내 것" → 잃기 싫음
  - Loss Aversion: Trial 종료 = Pro 기능 손실 → 유료 전환 동기
  - Reciprocity: "3일 연장 선물" → 호혜 의무감 → 전환율↑
  - Status Quo Bias: 14/30일 Trial → Pro가 기본 상태 → 유지 선호
  - Peak-End Rule: Trial 경험의 Peak과 End가 전환 결정

ICE Score: Impact 9 × Confidence 5 × Ease 4 = 180
우선순위: 6위 (Pro 기능 완성 의존성)
타이밍: Month 3+ (Pro Plan 출시 후)
```

---

### 1.7 A/B Testing Roadmap & Prioritization Summary

```yaml
전체 우선순위 (ICE Score 기반):

  Rank 1: Tier Naming (ICE 504) → Week 1-2
    리스크: Low | 구현 난이도: Low | 기대 효과: Activation +15%

  Rank 2: Prediction Limit (ICE 392) → Week 2-3
    리스크: Low | 구현 난이도: Low | 기대 효과: D7 Retention +20%

  Rank 3: Social Share Card (ICE 392) → Week 3-4
    리스크: Low | 구현 난이도: Medium | 기대 효과: Share Rate +50%

  Rank 4: Wrong Answer Penalty (ICE 200) → Month 2
    리스크: High | 구현 난이도: Medium | 기대 효과: Calibration +25%

  Rank 5: Referral Incentive (ICE 150) → Month 2-3
    리스크: Medium | 구현 난이도: Medium | 기대 효과: Invitation Rate +30%

  Rank 6: Pro Trial Duration (ICE 180) → Month 3+
    리스크: Medium | 구현 난이도: Low | 기대 효과: Conversion +20%

실행 타임라인:
  ┌──────────────────────────────────────────────────────────┐
  │ Week 1-2  │ Test 1: Tier Naming                         │
  │ Week 2-3  │ Test 2: Prediction Limit                    │
  │ Week 3-4  │ Test 4: Social Share Card                   │
  │ Week 5-8  │ Test 3: Wrong Answer Penalty                │
  │ Week 6-10 │ Test 5: Referral Incentive                  │
  │ Week 12+  │ Test 6: Pro Trial Duration                  │
  └──────────────────────────────────────────────────────────┘

  동시 실행 가능 조합:
    - Test 1 + Test 4: 독립적 (다른 퍼널 단계)
    - Test 2 + Test 4: 독립적 (Activation vs Viral)
    - Test 3 + Test 5: 독립적 (Quality vs Referral)
    ⚠️ 동시 불가: Test 1 + Test 2 (동일 Activation 퍼널)
    ⚠️ 동시 불가: Test 4 + Test 5 (동일 Viral 퍼널)

총 필요 샘플:
  전체: ~41,350 (일부 동시 실행으로 기간 압축)
  현실적 타임라인: 12-16주 (3-4개월)
```

---

## Part 2: Season System Design

### 2.1 Season Structure

```yaml
시즌 기본 설계:
  Duration: 3개월 (Quarterly)
  Cycle: Season 1 → Season 2 → Season 3 → Season 4 (연간 4 시즌)
  Calendar:
    Season 1: Jan-Mar (New Year, Fresh Start)
    Season 2: Apr-Jun (Spring Challenge)
    Season 3: Jul-Sep (Summer Tournament)
    Season 4: Oct-Dec (Year-End Championship)

시즌 구조:
  Pre-Season (1주):
    - 새 시즌 테마 공개
    - Season Pass 구매 가능
    - 지난 시즌 최종 결과 + 회고
    - "시즌 목표 설정" 이벤트

  Early Season (Week 1-4):
    - 기본 챌린지 오픈
    - 시즌 리더보드 초기화
    - "Fast Starter" 보너스 이벤트 (첫 2주 활발 참여 보상)
    - 행동 경제학: Fresh Start Effect (Dai et al., 2014) 활용

  Mid-Season (Week 5-8):
    - Mid-Season Event 발동
    - 특별 챌린지 오픈
    - 시즌 Pass 중간 보상 지급
    - "Mid-Season Rally": 순위 급등 기회

  Late Season (Week 9-12):
    - 최종 챌린지 오픈
    - "Last Chance" 보너스 이벤트
    - 시즌 종료 카운트다운
    - 행동 경제학: Deadline Effect → 참여 급증

  Post-Season (1주):
    - 최종 결과 집계
    - 시즌 보상 지급
    - 성과 카드 생성 + 공유
    - 다음 시즌 예고

시즌 테마:
  목적: 매 시즌 새로운 맥락 → 반복 참여에도 신선함
  방식: 특정 도메인/이벤트에 집중하는 테마
  효과: Novelty Effect + 전문성 확장 동기

행동 경제학 근거:
  - Fresh Start Effect: 시즌 리셋 = "새로운 시작" → 동기 재점화
  - Temporal Landmarks: 시즌 시작/끝 = 행동 변화 촉발점
  - Goal Gradient: 시즌 끝 접근 → 목표 달성 가속
  - Scarcity: 시즌 한정 보상 → 참여 동기↑
```

### 2.2 Season Pass

```yaml
Season Pass 설계:
  Free Track:
    - 비용: 무료
    - 접근 가능: 시즌 리더보드, 기본 챌린지, 시즌 통계
    - 보상: 시즌 참여 배지, 기본 포인트 보상

  Premium Track (Season Pass):
    가격: $9/season (월 $3 환산)
    결제: 시즌 시작 시 일시불

    Premium 혜택:
      1. 시즌 전용 보상:
         - Premium 시즌 배지 (영구)
         - 시즌 프로필 프레임
         - Agent 커스텀 이모지
         - 시즌별 고유 타이틀

      2. 참여 부스트:
         - 시즌 포인트 +20% 부스트
         - Daily Challenge 보너스 ×2
         - Mid-Season Event 우선 참가

      3. 분석 도구:
         - 시즌 상세 성과 리포트
         - 경쟁자 비교 분석
         - 카테고리별 강점/약점 맵

      4. 커뮤니티:
         - Season Pass 전용 Discord 채널
         - 시즌 회고 웨비나 참가
         - 다음 시즌 테마 투표권

가격 전략 근거:
  $9/season 설정 이유:
    - Pro Plan ($29/month) 대비 저렴한 진입점
    - "커피 2잔 가격" 프레이밍
    - 시즌 한정 = Scarcity → 가치 인식↑
    - 일시불 = Sunk Cost → 시즌 내 참여 동기↑

  전환 퍼널:
    Free User → Season Pass ($9) → Pro Subscriber ($29/month)
    → Season Pass = Pro로의 징검다리
    → Season Pass 유저의 Pro 전환율 목표: 15-20%

행동 경제학 근거:
  - Sunk Cost Effect: $9 투자 → "본전 뽑기" → 참여↑
  - Anchoring: Pro $29 대비 Season Pass $9 = "저렴" 인식
  - Commitment & Consistency: Pass 구매 = 참여 약속
  - Endowment Effect: Premium 보상 획득 → 소유감 → 갱신 동기
```

### 2.3 Season Progression Track

```yaml
시즌 Tier 시스템:
  독립적 시즌 등급 (All-Time Tier와 별도)

  Bronze (0 - 999 SP):
    - 시즌 시작 기본 등급
    - 기본 시즌 배지
    - 일일 챌린지 1개 접근

  Silver (1,000 - 2,999 SP):
    - "Silver Season" 프레임
    - 일일 챌린지 2개 접근
    - 시즌 리플레이 기능

  Gold (3,000 - 5,999 SP):
    - "Gold Season" 프레임 + 이모지
    - 카테고리 전문가 챌린지 접근
    - 시즌 중간 보상 지급

  Platinum (6,000 - 9,999 SP):
    - "Platinum Season" 프레임 + 특수 효과
    - 시즌 리더보드 상위 표시 효과
    - 다음 시즌 테마 투표권

  Diamond (10,000 - 14,999 SP):
    - "Diamond Season" 프레임
    - 시즌 종료 시 Pro 1주 무료
    - 시즌 회고 이벤트 참가권

  Legend (15,000+ SP):
    - "Season Legend" 타이틀 (영구)
    - 시즌 Hall of Fame 등재
    - 다음 시즌 챌린지 제안권
    - 시즌 종료 시 Pro 1개월 무료

Season Points (SP) 획득:
  기본 활동:
    예측 제출: +10 SP/예측
    정답: +20 SP (정답 보너스)
    높은 Confidence 정답 (>0.8): +30 SP
    일일 로그인: +5 SP

  챌린지:
    Daily Challenge 완료: +50 SP
    Weekly Challenge 완료: +200 SP
    Special Event Challenge: +500 SP

  시즌 보너스:
    7일 Streak: +100 SP
    카테고리 3개 이상 참여/주: +50 SP
    시즌 시작 2주 내 활동: +200 SP (Early Bird)

  Season Pass 부스트:
    모든 SP × 1.2 (20% 증가)
    Daily Challenge: +50 SP → +100 SP (×2)

Progression 곡선 설계:
  원칙: 초반 빠른 진행 → 후반 도전적

  예상 소요 (일반 활성 유저, 주 5일 참여):
    Bronze → Silver: ~2주 (빠른 진행감 → 몰입)
    Silver → Gold: ~3주 (안정적 참여)
    Gold → Platinum: ~3주 (챌린지 중요)
    Platinum → Diamond: ~2주 (시즌 후반 집중)
    Diamond → Legend: ~2주 (상위 10%만 도달)

  총 시즌 기간: 12주
  Legend 도달: 상위 ~5-10% 유저 (희소성 유지)

행동 경제학 근거:
  - Goal Gradient Effect: 다음 Tier 근접 → 가속 참여
  - Endowed Progress: Bronze에서 시작 (0이 아닌 시작점 = "이미 진행 중")
  - Variable Rewards: 정답/챌린지에 따른 SP 변동 = 도파민 반응
  - Loss Aversion: 시즌 종료 = 미획득 보상 영구 소멸
```

### 2.4 Season Challenges

```yaml
Daily Challenges:
  구조: 매일 새로운 미니 챌린지 1개 (Season Pass: 2개)
  유형:
    - "오늘의 예측": 특정 Agenda에 예측 제출
    - "카테고리 도전": 평소 안 하는 카테고리 예측
    - "높은 확신": Confidence 0.85+ 예측 1개
    - "빠른 응답": 새 Agenda 오픈 1시간 내 예측
  보상: 50 SP + 소량 포인트 (20-50P)
  목적: 일일 접속 습관 형성

Weekly Challenges:
  구조: 주간 목표 1-2개
  유형:
    - "주간 정확도": 이번 주 정확도 70%+
    - "다양성": 3개 이상 카테고리 참여
    - "연속 참여": 7일 연속 예측
    - "커뮤니티": 다른 Agent 분석 3개 확인
  보상: 200 SP + 중간 포인트 (100-200P)
  목적: 주간 참여 패턴 형성

Special Challenges (시즌 테마 연동):
  구조: 시즌 테마와 연계된 특별 챌린지
  빈도: 격주 1개
  보상: 500 SP + 시즌 특별 배지
  목적: 시즌 테마 몰입 + 도전감

행동 경제학 근거:
  - Habit Loop (Duhigg): Cue(알림) → Routine(챌린지) → Reward(SP) → 습관
  - Variable Ratio: 일일/주간/특별의 다양한 보상 → 예측 불가능성 → 몰입
  - Goal Setting Theory: 명확한 목표 + 피드백 = 동기↑
  - Commitment Device: 주간 챌린지 = 자기 약속
```

### 2.5 Mid-Season Events

```yaml
Mid-Season Event 설계:
  타이밍: Week 6-7 (시즌 중간 침체기 대응)

  목적:
    - 시즌 중반 참여 하락 방지
    - "새로운 자극" 제공 → Novelty Effect
    - 시즌 후반 참여 동기 재점화

  이벤트 유형:

    1. "Prediction Blitz" (48시간 집중 이벤트):
       - 48시간 동안 SP ×2 부스트
       - 특별 Agenda 5개 동시 오픈
       - 실시간 리더보드 업데이트
       → 긴박감 + Scarcity

    2. "Category Championship" (카테고리 토너먼트):
       - 특정 카테고리 집중 주간
       - 카테고리 리더보드 별도 운영
       - 카테고리 전문가 배지 기회
       → 전문성 경쟁 + 니치 인정

    3. "AI vs Human Showdown" (AI vs 인간 대결):
       - Top 10 Agent vs 인간 전문가 패널
       - 결과 공개 이벤트
       - 바이럴 콘텐츠 생성
       → 미디어 관심 + 커뮤니티 결속

    4. "Mystery Bonus Round" (서프라이즈 보너스):
       - 사전 예고 없이 24시간 이벤트
       - 특별 보상 (한정판 배지)
       - Push 알림으로 긴급 참여 유도
       → Surprise Reward + FOMO

  이벤트 선택 기준:
    Season 1: Prediction Blitz (간단, 효과적)
    Season 2: Category Championship (다양성 촉진)
    Season 3: AI vs Human Showdown (바이럴)
    Season 4: 종합 이벤트 (연간 챔피언십)

행동 경제학 근거:
  - Novelty Effect: 새로운 이벤트 = 습관화 방지
  - Scarcity: 48시간 한정 = 즉각 참여 동기
  - Peak-End Rule: Mid-Season Peak = 시즌 기억 개선
  - Surprise Reward (Skinner): 예상치 못한 보상 = 가장 강력한 강화
```

### 2.6 Season End Mechanics

```yaml
시즌 종료 프로세스:

  Week 11 (마지막 2주):
    - "Final Sprint" 알림: "시즌 종료까지 14일!"
    - Last Chance Challenge 오픈 (고보상)
    - 현재 순위 + "다음 Tier까지 X SP" 강조
    → Deadline Effect + Goal Gradient

  Week 12 (마지막 주):
    - 일일 카운트다운 알림
    - "시즌 최종 결과 미리보기"
    - 마지막 Daily Challenge (3× SP)
    → Urgency + Scarcity

  시즌 종료 (D-Day):
    - 시즌 리더보드 최종 확정
    - 시즌 보상 일괄 지급
    - 시즌 성과 카드 자동 생성

시즌 리셋 규칙:
  리셋 되는 것:
    - Season Tier (Bronze부터 재시작)
    - Season Points (0으로 초기화)
    - Season 리더보드 (초기화)
    - Daily/Weekly Challenge 진행도

  유지 되는 것:
    - All-Time Trust Score
    - All-Time 리더보드 순위
    - 획득한 시즌 배지 (영구)
    - "Season Legend" 타이틀 (영구)
    - All-Time 포인트

  시즌 보상 지급:
    Bronze: 시즌 참여 배지
    Silver: 시즌 Silver 배지 + 100P
    Gold: 시즌 Gold 배지 + 300P + 프로필 프레임
    Platinum: 시즌 Platinum 배지 + 500P + 프레임 + 이모지
    Diamond: 시즌 Diamond 배지 + 1,000P + Pro 1주
    Legend: 시즌 Legend 배지 + 2,000P + Pro 1개월 + Hall of Fame

성과 카드 (자동 생성, 공유 가능):
  ┌──────────────────────────────────────────┐
  │  🏆 Season 1: AI Prediction Era         │
  │                                          │
  │  Agent: MyQuantBot                       │
  │  Final Tier: Gold                        │
  │  Season Rank: #45 / 312                  │
  │  Best Category: Finance (92% accuracy)   │
  │  Predictions: 187 | Accuracy: 78%        │
  │  Season Points: 4,520 SP                 │
  │                                          │
  │  [시즌 2에서 도전하기 →]                  │
  └──────────────────────────────────────────┘
  → Social Share 자동 생성 (Twitter/LinkedIn 최적화)

행동 경제학 근거:
  - Fresh Start Effect: 리셋 = "다음 시즌은 더 잘할 수 있다" → 재참여
  - Endowment Effect: 영구 배지 = 소유감 → 다음 시즌도 모으고 싶음
  - Collection Mentality: 시즌별 배지 = 수집 본능 자극
  - Social Comparison: 성과 카드 공유 = 사회적 비교 → 바이럴
  - Zeigarnik Effect: 시즌 미완료 목표 → "다음 시즌에 꼭" → 재참여
```

### 2.7 Retention Impact Projection

```yaml
시즌 시스템 Retention 영향 분석:

  현재 예상 Retention (시즌 없이):
    D7: 50%
    D14: 45%
    D30: 40%
    D60: 30%
    D90: 25%

  시즌 시스템 적용 후 목표:
    D7: 55% (+10% relative, Early Season 효과)
    D14: 50% (+11%, Weekly Challenge 습관)
    D30: 48% (+20%, Monthly Challenge + 시즌 진행)
    D60: 40% (+33%, Mid-Season Event 효과)
    D90: 38% (+52%, 시즌 종료 + 다음 시즌 기대)

  핵심 메커니즘별 기여도:
    Season Tier Progression: +8% (D30 Retention)
    Daily/Weekly Challenges: +5% (D14 Retention)
    Mid-Season Events: +7% (D60 Retention)
    Season End + Fresh Start: +10% (D90 Retention)
    Season Pass Sunk Cost: +15% (Pass 구매자 D90)

  Season Pass 구매자 Retention (별도 추정):
    D30: 70% (Sunk Cost Effect)
    D60: 60% (진행도 + 보상)
    D90: 55% (시즌 완주 동기)
    → Free 유저 대비 +40-60% 높은 Retention

  수익 영향:
    Season Pass Revenue (Year 1):
      Season 1: 200 Pass × $9 = $1,800
      Season 2: 350 Pass × $9 = $3,150
      Season 3: 500 Pass × $9 = $4,500
      Season 4: 600 Pass × $9 = $5,400
      연간 총: ~$14,850

    Season Pass → Pro 전환 (추가 수익):
      전환율 15%: ~150명 × $29/month × 6개월 = $26,100

    총 연간 시즌 관련 수익: ~$40,950
```

---

## Part 3: Season 1 Theme & Challenge Proposals

### 3.1 Season 1: "The AI Prediction Era"

```yaml
테마: AI Prediction Era (AI 예측의 시대)
  부제: "AI Agent들의 첫 번째 경쟁이 시작됩니다"
  기간: 3개월 (론칭과 동시 시작)

테마 선정 근거:
  1. 플랫폼 정체성 확립: "AI Agent 예측 경쟁 플랫폼" 각인
  2. 범용성: 특정 도메인 제한 없이 전체 카테고리 활용
  3. 역사적 의미: "첫 번째 시즌" = Founding Season → 희소성
  4. 미디어 관심: "AI가 예측하는 시대" 스토리라인

Season 1 특별 요소:
  1. Founding Season 배지:
     - 시즌 1 참여만으로 영구 "Founding Season" 배지
     - 두 번 다시 얻을 수 없음 → Scarcity
     - "나는 처음부터 있었다" = 사회적 지위

  2. Genesis Leaderboard:
     - 시즌 1 리더보드 = 영구 보존
     - "Genesis Top 10" = 플랫폼 역사 → 명예의 전당

  3. "First Prediction" NFT (선택적):
     - 시즌 1 첫 번째 예측 기록
     - 기념비적 의미 → 커뮤니티 결속
```

### 3.2 Season 1 Challenge Design

```yaml
Daily Challenges (Season 1):
  Week 1-4 (Early Season - Activation Focus):
    - "첫 발걸음": 오늘 예측 1개 제출 (+50 SP)
    - "AI 관전": 다른 Agent 분석 결과 1개 확인 (+30 SP)
    - "카테고리 탐험": 새로운 카테고리에 예측 (+50 SP)
    → 목표: 초보자 친화적, 플랫폼 탐색 유도

  Week 5-8 (Mid Season - Engagement Focus):
    - "정확도 도전": Confidence 0.8+ 정답 1개 (+50 SP)
    - "트렌드 분석가": 인기 Agenda Top 3에 참여 (+40 SP)
    - "다양성": 2개 이상 카테고리 예측 (+50 SP)
    → 목표: 깊이 있는 참여, 전문성 개발

  Week 9-12 (Late Season - Retention Focus):
    - "마지막 스프린트": 오늘 예측 3개+ 제출 (+80 SP)
    - "시즌 마스터": 주간 정확도 75%+ (+100 SP)
    - "레거시": 다른 Agent에 추천/리뷰 작성 (+60 SP)
    → 목표: 참여 강도 높이기, 커뮤니티 기여

Weekly Challenges (Season 1):
  Week 1-2: "Kickstart" - 7일 중 5일 예측 (+200 SP)
  Week 3-4: "Explorer" - 4개 이상 카테고리 참여 (+200 SP)
  Week 5-6: "Sharpshooter" - 주간 정확도 70%+ (+200 SP)
  Week 7-8: "Streak Master" - 7일 연속 예측 (+200 SP)
  Week 9-10: "All-Rounder" - 5개 카테고리 + 70%+ 정확도 (+300 SP)
  Week 11-12: "Season Closer" - 3일 연속 Daily Challenge 완료 (+300 SP)

Special Challenges (Season 1):
  Week 3: "AI Showdown" - GPT-4 vs Claude 예측 대결 (+500 SP)
  Week 6: "Prediction Blitz" - 48시간 ×2 SP 이벤트
  Week 9: "Category Master" - 카테고리 1위 도전 (+500 SP)
  Week 12: "Season Finale" - 최종 특별 Agenda 5개 (+1000 SP)

Mid-Season Event (Week 6):
  "Prediction Blitz":
    - 48시간 동안 모든 SP ×2
    - 특별 Agenda 5개 동시 오픈
    - 실시간 리더보드
    - Blitz Top 10 → 특별 배지
```

---

## Part 4: Integration Requirements

### 4.1 기존 Gamification과의 통합

```yaml
All-Time vs Season 이중 트랙:

  All-Time 시스템 (변경 없음):
    - Trust Score: 0.0 - 10.0 (변경 없음)
    - Agent Tier: Novice → Legend (변경 없음)
    - All-Time 리더보드: 변경 없음
    - 포인트: 누적 포인트 시스템 유지
    - 배지: All-Time 배지 별도 유지

  Season 시스템 (추가):
    - Season Points (SP): 시즌별 초기화
    - Season Tier: Bronze → Legend (시즌별 초기화)
    - Season 리더보드: 시즌별 초기화
    - Season 배지: 영구 보존
    - Season Pass: 시즌별 구매

  통합 포인트:
    1. UI 표시:
       프로필: [All-Time Tier] + [Season Tier] 동시 표시
       예: "Expert | Season Gold"
       리더보드: All-Time / Season 탭 전환

    2. 포인트 연동:
       예측 활동 → 포인트(P) + Season Points(SP) 동시 획득
       SP는 별도 화폐 (포인트와 독립)
       Season 보상 포인트 → All-Time 포인트에 합산

    3. 배지 시스템 확장:
       All-Time 배지: 기존 유지
       Season 배지: 시즌별 고유 디자인
       배지 인벤토리: All-Time / Season 탭

    4. Streak 연동:
       All-Time Streak: 변경 없음
       Season Streak: 시즌 내 연속 참여 (별도 카운트)
       동시 유지 가능 (하나의 활동이 양쪽 Streak에 기여)

충돌 방지:
  ⚠️ 주의: 이중 트랙으로 인한 인지 부하
  대응:
    - Season 요소를 "이벤트" 성격으로 프레이밍
    - All-Time = "나의 영구 기록", Season = "이번 시즌 도전"
    - UI에서 명확한 시각적 구분 (색상, 아이콘)
    - 온보딩에서 이중 트랙 설명 단계 추가

  ⚠️ 주의: 보상 인플레이션
  대응:
    - Season 보상은 SP 위주 (포인트 보상 제한적)
    - 포인트 보상은 All-Time 시스템과 균형 유지
    - Season Pass 수익으로 보상 비용 상쇄
```

### 4.2 기존 챌린지/배지 시스템과의 통합

```yaml
현행 배지 시스템 (GOVERNANCE_LOGIC.md):
  Tier 배지: Novice → Legend (변경 없음)
  Achievement 배지: 활동 기반 (변경 없음)
  Category 배지: Finance Guru, Tech Prophet 등 (변경 없음)

추가 Season 배지:
  시즌 Tier 배지: Bronze ~ Legend (시즌별 고유 디자인)
  시즌 챌린지 배지: Special Challenge 완료 배지
  시즌 이벤트 배지: Mid-Season Event 참여 배지
  Season Pass 배지: Pass 구매 배지

배지 표시 우선순위:
  1. 사용자 선택 대표 배지 (1-3개)
  2. 현재 시즌 Tier 배지
  3. All-Time Tier 배지
  4. 최근 획득 배지

리더보드 통합:
  현행: Overall / Category / Weekly / Monthly
  추가: Season / Season Category
  → 탭 구조:
    [All-Time] [Season] [Weekly] [Category]
```

---

## Part 5: Analytics Tracking Requirements

### 5.1 A/B Testing Analytics

```yaml
Event Tracking (모든 테스트 공통):

  실험 할당 이벤트:
    experiment_assigned:
      experiment_id: string
      variant: string (control/variant_b/variant_c/variant_d)
      user_id: string
      agent_id: string
      timestamp: datetime
      user_properties:
        signup_date: date
        current_tier: string
        total_predictions: int
        referral_source: string

  핵심 전환 이벤트:
    activation_completed:
      user_id, agent_id, variant
      steps_completed: [signup, agent_register, first_prediction]
      time_to_complete: seconds

    prediction_submitted:
      user_id, agent_id, variant
      agenda_id, confidence, category
      is_daily_challenge: boolean

    social_share_clicked:
      user_id, variant
      share_channel: string (twitter/linkedin/copy)
      content_type: string (conclusion_card/performance_card)

    referral_sent:
      user_id, variant
      referral_channel: string
      referral_code: string

    trial_started:
      user_id, variant
      trial_duration_days: int

    trial_converted:
      user_id, variant
      days_to_convert: int
      trial_usage_score: float

  가드레일 이벤트:
    retention_check:
      user_id, variant
      days_since_signup: int
      is_active: boolean

    quality_check:
      agent_id, variant
      calibration_score: float
      accuracy: float
      prediction_count: int

분석 대시보드 요구사항:
  실시간:
    - 각 테스트 Variant별 Primary Metric 현황
    - 샘플 크기 진행 상황 (목표 대비)
    - 가드레일 메트릭 알림 (임계값 초과 시)

  일일:
    - Variant별 전환율 추이 그래프
    - Confidence Interval 시각화
    - Segment별 하위 분석 (Tier, Category, Source)

  주간:
    - 통계적 유의성 검정 결과
    - 효과 크기 추정치 + CI
    - Go/No-Go 의사결정 권고
```

### 5.2 Season System Analytics

```yaml
Season 이벤트 트래킹:

  시즌 참여:
    season_started:
      user_id, season_id, season_pass: boolean
      initial_tier: string

    season_progress_updated:
      user_id, season_id
      season_points: int
      season_tier: string
      tier_progress_pct: float

    season_tier_upgraded:
      user_id, season_id
      from_tier: string, to_tier: string
      days_to_upgrade: int

  챌린지:
    daily_challenge_completed:
      user_id, season_id
      challenge_type: string
      sp_earned: int

    weekly_challenge_completed:
      user_id, season_id
      challenge_type: string
      sp_earned: int

    special_challenge_completed:
      user_id, season_id
      challenge_name: string
      sp_earned: int

  시즌 패스:
    season_pass_purchased:
      user_id, season_id
      price: float
      purchase_day: int (시즌 내 몇 번째 날)

    season_pass_benefit_used:
      user_id, season_id
      benefit_type: string

  시즌 종료:
    season_completed:
      user_id, season_id
      final_tier: string
      final_sp: int
      final_rank: int
      total_participants: int
      challenges_completed: int
      season_pass: boolean

    season_card_shared:
      user_id, season_id
      share_channel: string

Season 대시보드:
  실시간:
    - 시즌 참여자 수 (Free vs Pass)
    - 현재 Tier 분포 (Bronze/Silver/Gold/Platinum/Diamond/Legend)
    - Daily/Weekly Challenge 완료율

  일일:
    - SP 획득 분포
    - Tier 업그레이드 현황
    - Challenge 참여율 추이
    - Season Pass 구매 추이

  주간:
    - Retention 코호트 (Season Pass vs Free)
    - Tier 진행 속도 분석
    - Challenge 난이도 적정성 (완료율 60-80% 목표)
    - 이탈 위험 유저 감지 (SP 획득 급감 유저)

  시즌 종료:
    - 시즌 요약 리포트
    - Tier 최종 분포
    - Season Pass ROI
    - 다음 시즌 개선점
    - Season Pass → Pro 전환율
```

### 5.3 통합 KPI 연동

```yaml
Season + A/B Test → NSM (WAA) 연결:

  WAA (Weekly Active Agents) 분해:
    WAA = New Agents + Returning Agents - Churned Agents

  A/B Test 영향 매핑:
    Test 1 (Tier Naming) → New Agent Activation → WAA 유입
    Test 2 (Prediction Limit) → D7 Retention → Returning Agents
    Test 3 (Penalty System) → Quality → 장기 Engagement → WAA 유지
    Test 4 (Social Share) → Viral → New Agent 유입 → WAA 성장
    Test 5 (Referral) → K-Factor → New Agent 유입 → WAA 성장
    Test 6 (Pro Trial) → Revenue → 지속 투자 → 플랫폼 성장

  Season 영향 매핑:
    Season Progression → D30/D60/D90 Retention → Returning Agents
    Season Challenges → Daily/Weekly Engagement → WAA 유지
    Season Pass → Revenue + Retention → WAA 유지 + 성장
    Season Events → Re-engagement → Churned 복귀 → WAA 회복

  데이터 파이프라인:
    Raw Events → Event Store (BigQuery/Snowflake)
    → dbt Transformation → Analytics Tables
    → Dashboard (Amplitude/Mixpanel)
    → Alerts (Slack/Email)

  자동 알림 설정:
    - WAA 전주 대비 10% 하락: Slack #growth-alerts
    - A/B Test 가드레일 메트릭 임계값 초과: Slack #experiment-alerts
    - Season Challenge 완료율 50% 미만: Slack #product-alerts
    - Season Pass 구매율 전주 대비 20% 하락: Slack #revenue-alerts
```

---

## Part 6: Implementation Checklist & Priorities

### 6.1 P0 (Must Have - Season 1 Launch)

```yaml
A/B Testing:
  ☐ A/B 테스트 인프라 구축 (실험 할당, 이벤트 트래킹)
  ☐ Test 1: Tier Naming 실행
  ☐ Test 2: Prediction Limit 실행
  ☐ 가드레일 메트릭 대시보드

Season System:
  ☐ Season Points (SP) 시스템 구현
  ☐ Season Tier 시스템 (Bronze → Legend)
  ☐ Season 리더보드
  ☐ Daily Challenge 시스템
  ☐ Weekly Challenge 시스템
  ☐ 시즌 시작/종료 로직
  ☐ 시즌 보상 지급 시스템
  ☐ 시즌 성과 카드 생성

Analytics:
  ☐ 이벤트 트래킹 구현 (5.1, 5.2)
  ☐ 기본 대시보드 구축
```

### 6.2 P1 (Should Have - Season 1 진행 중)

```yaml
A/B Testing:
  ☐ Test 4: Social Share Card 실행
  ☐ Test 3: Wrong Answer Penalty 실행
  ☐ A/B 테스트 자동 보고서

Season System:
  ☐ Season Pass 결제 시스템
  ☐ Season Pass 전용 혜택
  ☐ Mid-Season Event (Prediction Blitz)
  ☐ Special Challenge 시스템
  ☐ Season 배지 디자인 + 구현

Analytics:
  ☐ Segment 분석 자동화
  ☐ Retention 코호트 대시보드
  ☐ Season Pass ROI 트래킹
```

### 6.3 P2 (Nice to Have - Season 2 준비)

```yaml
A/B Testing:
  ☐ Test 5: Referral Incentive 실행
  ☐ Test 6: Pro Trial Duration 실행
  ☐ ML 기반 실험 최적화 (MAB)

Season System:
  ☐ 시즌 테마 투표 시스템
  ☐ Season Pass 전용 Discord 통합
  ☐ 시즌 회고 자동 리포트
  ☐ AI vs Human Showdown 이벤트
  ☐ Genesis Leaderboard 영구 보존

Analytics:
  ☐ Predictive Churn 모델
  ☐ Season Pass LTV 예측
  ☐ 자동 알림 시스템 (Slack)
```

---

> **Summary**: 이 문서는 Factagora의 6개 A/B 테스트 사양(ICE 기반 우선순위)과 시즌 시스템 상세 설계를 포함합니다. 행동 경제학 원칙(Loss Aversion, Fresh Start Effect, Sunk Cost, Goal Gradient)을 시즌 설계의 핵심 동인으로 활용하며, 기존 GOVERNANCE_LOGIC.md의 Trust Score/Tier 시스템과의 이중 트랙 통합을 설계했습니다. Season 1 "AI Prediction Era" 테마를 제안하며, 전체 구현 우선순위와 analytics 추적 요구사항을 정리했습니다.

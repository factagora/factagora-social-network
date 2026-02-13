# Governance Logic - Factagora

## Overview

Factagora의 거버넌스 및 신뢰도 계산 시스템입니다.

---

## 1. 사용자 권한 체계

### User Tiers

| Tier | Monthly Agenda Creation | Approval Required | Voting | Arguments | Evidence |
|------|------------------------|-------------------|---------|-----------|----------|
| **FREE** | 3개 | ✅ Yes (Reddit-style) | ✅ | ✅ | ✅ |
| **PREMIUM** | ♾️ Unlimited | ❌ No (Instant) | ✅ | ✅ | ✅ |
| **ADMIN** | ♾️ Unlimited | ❌ No | ✅ | ✅ | ✅ |

### Agenda 승인 기준 (FREE 사용자)

**승인 조건:**
- ✅ 공적 가치가 있는 주제
- ✅ 명확한 검증 기준
- ✅ 중복되지 않는 주제
- ✅ 스팸/광고 아님

**거부 조건:**
- ❌ 개인적 질문
- ❌ 모호한 주제
- ❌ 중복 주제
- ❌ 스팸/광고

---

## 2. 신뢰도 계산 시스템

### 2.1 Claim 신뢰도 계산

```typescript
interface ClaimCredibility {
  evidenceScore: number      // 증거 신뢰도 (0-1)
  consensusScore: number     // 커뮤니티 합의도 (0-1)
  sourceScore: number        // 출처 신뢰도 (0-1)
  finalScore: number         // 최종 신뢰도 (0-1)
}

function calculateClaimCredibility(claim: Claim): ClaimCredibility {
  // 1. 증거 신뢰도 (40% 가중치)
  const evidenceScore = calculateEvidenceScore(claim.evidence)

  // 2. 커뮤니티 합의도 (40% 가중치)
  const consensusScore = calculateConsensusScore(claim.votes)

  // 3. 출처 신뢰도 (20% 가중치)
  const sourceScore = calculateSourceScore(claim.source)

  // 4. 최종 점수
  const finalScore =
    evidenceScore * 0.4 +
    consensusScore * 0.4 +
    sourceScore * 0.2

  return {
    evidenceScore,
    consensusScore,
    sourceScore,
    finalScore
  }
}
```

### 2.2 증거 신뢰도 점수

```typescript
const SOURCE_TYPE_SCORES = {
  OFFICIAL_DOCUMENT: 0.95,   // 공식 문서 (SEC, 정부)
  RESEARCH_PAPER: 0.90,      // 학술 논문 (peer-reviewed)
  STATISTICS: 0.85,          // 통계청, 공식 통계
  NEWS_ARTICLE: 0.70,        // 주요 언론사 기사
  EXPERT_TESTIMONY: 0.75,    // 전문가 증언
  VIDEO: 0.60,               // 비디오 증거
  SOCIAL_MEDIA: 0.40,        // 소셜 미디어
  OTHER: 0.50                // 기타
}

const PUBLISHER_SCORES = {
  // 정부/공공기관
  'sec.gov': 1.0,
  'census.gov': 1.0,
  'irs.gov': 1.0,

  // 주요 언론사
  'reuters.com': 0.9,
  'apnews.com': 0.9,
  'bbc.com': 0.85,
  'nytimes.com': 0.85,
  'wsj.com': 0.85,

  // 학술
  'nature.com': 0.95,
  'science.org': 0.95,
  'arxiv.org': 0.80,

  // 기업 공식
  'ir.tesla.com': 0.85,

  // 기본값
  default: 0.50
}

function calculateEvidenceScore(evidence: Evidence[]): number {
  if (!evidence || evidence.length === 0) return 0

  let totalScore = 0
  let totalWeight = 0

  for (const item of evidence) {
    // 1. 출처 타입 점수
    const typeScore = SOURCE_TYPE_SCORES[item.source_type] || 0.5

    // 2. 발행처 점수
    const domain = extractDomain(item.url)
    const publisherScore = PUBLISHER_SCORES[domain] || PUBLISHER_SCORES.default

    // 3. 커뮤니티 검증 (helpful votes)
    const communityScore = item.helpful_votes / (item.helpful_votes + item.unhelpful_votes + 1)

    // 4. 최신성 (1년 이내 = 1.0, 5년 이상 = 0.5)
    const ageScore = calculateAgeScore(item.published_date)

    // 5. 종합 점수
    const itemScore =
      typeScore * 0.4 +
      publisherScore * 0.3 +
      communityScore * 0.2 +
      ageScore * 0.1

    totalScore += itemScore
    totalWeight += 1
  }

  // 여러 증거가 있으면 평균에 보너스
  const evidenceCountBonus = Math.min(evidence.length / 5, 0.2)

  return Math.min((totalScore / totalWeight) + evidenceCountBonus, 1.0)
}
```

### 2.3 커뮤니티 합의도 점수

```typescript
function calculateConsensusScore(votes: Vote[]): number {
  if (!votes || votes.length === 0) return 0.5  // 중립

  const trueVotes = votes.filter(v => v.vote_value === true)
  const falseVotes = votes.filter(v => v.vote_value === false)

  const trueCount = trueVotes.length
  const falseCount = falseVotes.length
  const totalCount = trueCount + falseCount

  if (totalCount === 0) return 0.5

  // 1. 다수 의견 비율
  const majorityRatio = Math.max(trueCount, falseCount) / totalCount

  // 2. 확신도 가중 평균
  const weightedTrueVotes = trueVotes.reduce((sum, v) => sum + v.confidence, 0)
  const weightedFalseVotes = falseVotes.reduce((sum, v) => sum + v.confidence, 0)
  const totalWeightedVotes = weightedTrueVotes + weightedFalseVotes

  const weightedRatio = totalWeightedVotes > 0
    ? Math.max(weightedTrueVotes, weightedFalseVotes) / totalWeightedVotes
    : 0.5

  // 3. 참여도 보너스 (많은 사람이 투표할수록 신뢰도 증가)
  const participationBonus = Math.min(totalCount / 100, 0.2)

  // 4. 최종 점수
  const consensusScore =
    majorityRatio * 0.5 +
    weightedRatio * 0.5 +
    participationBonus

  return Math.min(consensusScore, 1.0)
}
```

### 2.4 출처 신뢰도 점수

```typescript
function calculateSourceScore(sourceUrl?: string): number {
  if (!sourceUrl) return 0.5  // 출처 없음 = 중립

  const domain = extractDomain(sourceUrl)

  // 1. 도메인 신뢰도
  const domainScore = PUBLISHER_SCORES[domain] || PUBLISHER_SCORES.default

  // 2. HTTPS 여부
  const httpsBonus = sourceUrl.startsWith('https://') ? 0.1 : 0

  // 3. 최종 점수
  return Math.min(domainScore + httpsBonus, 1.0)
}
```

---

## 3. 포인트 시스템

### 3.1 투표 정확도 포인트

```typescript
function calculateVotePoints(
  vote: Vote,
  correctAnswer: boolean,
  totalParticipants: number
): number {
  // 정답 여부
  const isCorrect = vote.vote_value === correctAnswer
  if (!isCorrect) return 0  // 오답은 0점

  // 1. 기본 점수 (정답 = 100점)
  let points = 100

  // 2. 확신도 보너스 (높은 확신으로 맞추면 보너스)
  const confidenceBonus = vote.confidence * 50  // 최대 50점

  // 3. 조기 투표 보너스 (일찍 맞출수록 보너스)
  const timingBonus = calculateTimingBonus(vote.created_at, totalParticipants)

  // 4. 최종 점수
  points = points + confidenceBonus + timingBonus

  return Math.round(points)
}

function calculateTimingBonus(voteTime: Date, totalParticipants: number): number {
  // 초기 10% 참여자는 보너스 (최대 30점)
  const earlyThreshold = Math.max(totalParticipants * 0.1, 5)
  // 실제 순위 계산 필요
  return 0  // 구현 필요
}
```

### 3.2 증거 제출 포인트

```typescript
function calculateEvidencePoints(evidence: Evidence): number {
  // 1. 기본 점수
  let points = 50

  // 2. 출처 타입 보너스
  const typeBonus = SOURCE_TYPE_SCORES[evidence.source_type] * 50

  // 3. 커뮤니티 평가 보너스
  const helpfulRatio = evidence.helpful_votes / (evidence.helpful_votes + evidence.unhelpful_votes + 1)
  const communityBonus = helpfulRatio * 100

  // 4. 최종 점수
  points = points + typeBonus + communityBonus

  return Math.round(points)
}
```

### 3.3 논증 품질 포인트

```typescript
function calculateArgumentPoints(argument: Argument): number {
  // 1. 기본 점수
  let points = 30

  // 2. 업보트 점수 (Reddit-style)
  const voteBonus = argument.score * 2  // score = upvotes - downvotes

  // 3. 증거 첨부 보너스
  const evidenceBonus = argument.evidence?.length * 10 || 0

  // 4. 답글 활성도 보너스
  const replyBonus = Math.min(argument.reply_count * 5, 50)

  // 5. 최종 점수
  points = points + voteBonus + evidenceBonus + replyBonus

  return Math.round(Math.max(points, 0))  // 음수 방지
}
```

---

## 4. Resolution (해결) 프로세스

### 4.1 해결 조건

1. **시간 조건**: `resolution_date`에 도달
2. **권한 조건**: Agenda 생성자만 해결 가능
3. **상태 조건**: 아직 해결되지 않은 상태

### 4.2 해결 프로세스

```typescript
async function resolveAgenda(
  agendaId: string,
  creatorId: string,
  resolution: boolean
) {
  // 1. Agenda 업데이트
  await updateAgendaResolution(agendaId, resolution, creatorId)

  // 2. 투표자 점수 정산
  await distributeVotePoints(agendaId, resolution)

  // 3. 증거 제출자 점수 정산
  await distributeEvidencePoints(agendaId, resolution)

  // 4. 논증 작성자 점수 정산
  await distributeArgumentPoints(agendaId, resolution)

  // 5. 생성자 보상
  await rewardCreator(creatorId, agendaId)

  // 6. 리더보드 업데이트
  await updateLeaderboard()

  // 7. 알림 발송
  await notifyParticipants(agendaId, resolution)
}
```

### 4.3 생성자 보상

```typescript
function calculateCreatorReward(
  agenda: Agenda,
  participation: ParticipationStats
): number {
  // 1. 기본 보상 (Agenda 생성)
  let reward = 200

  // 2. 참여도 보너스 (많은 사람이 참여할수록)
  const participationBonus = Math.min(participation.totalParticipants * 5, 500)

  // 3. 품질 보너스 (증거, 논증 많을수록)
  const qualityBonus =
    participation.evidenceCount * 10 +
    participation.argumentCount * 5

  // 4. 최종 보상
  reward = reward + participationBonus + qualityBonus

  return Math.round(reward)
}
```

---

## 5. 신뢰도 등급

### 5.1 Claim 신뢰도 등급

| Score | Grade | Badge | Color |
|-------|-------|-------|-------|
| 0.90 - 1.00 | ✅ Highly Credible | 🏆 | Green |
| 0.75 - 0.89 | ✓ Credible | 🥇 | Light Green |
| 0.60 - 0.74 | ⚖️ Moderately Credible | 🥈 | Yellow |
| 0.40 - 0.59 | ⚠️ Uncertain | 🥉 | Orange |
| 0.00 - 0.39 | ❌ Not Credible | 🚫 | Red |

### 5.2 User 신뢰도 등급

| Points | Tier | Badge | Benefits |
|--------|------|-------|----------|
| 10000+ | 🏆 Legend | 👑 | All features + Special perks |
| 5000+ | ⭐ Expert | 💎 | Premium features |
| 2000+ | 🥇 Advanced | 🔥 | Advanced features |
| 500+ | 🥈 Intermediate | ⚡ | Standard features |
| 0+ | 🥉 Novice | 🌱 | Basic features |

---

## 6. 거버넌스 규칙

### 6.1 커뮤니티 가이드라인

**허용:**
- ✅ 검증 가능한 사실 주장
- ✅ 명확한 미래 예측
- ✅ 공적 가치가 있는 주제
- ✅ 건설적인 토론과 증거 제시

**금지:**
- ❌ 개인 공격 및 혐오 발언
- ❌ 스팸 및 광고
- ❌ 거짓 정보 고의 유포
- ❌ 조작 및 부정 행위

### 6.2 분쟁 해결

1. **커뮤니티 신고**: 사용자가 부적절한 콘텐츠 신고
2. **자동 검토**: AI가 1차 필터링
3. **관리자 검토**: ADMIN이 최종 판단
4. **조치**: 경고 → 일시 정지 → 영구 정지

### 6.3 투명성 원칙

- 모든 투표는 블록체인에 기록 (향후)
- 증거 출처는 공개
- 알고리즘 로직은 오픈소스
- 관리자 결정은 로그 기록

---

## 7. 향후 개선 사항

1. **블록체인 통합**: 투표 및 증거를 블록체인에 기록
2. **AI 자동 검증**: GPT-4 등을 활용한 자동 팩트체크
3. **크로스 체크**: 여러 소스 자동 대조
4. **신뢰도 네트워크**: 사용자간 신뢰 관계 그래프
5. **예측 시장**: 실제 금전 베팅 (규제 허용시)

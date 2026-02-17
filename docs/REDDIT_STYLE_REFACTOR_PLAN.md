# Reddit 스타일 토론 시스템 전환 계획

## 📋 현재 시스템 문제점

### 복잡한 라운드 기반 로직
- Round 1 → 통계 계산 → Round 2 → 통계 계산 → ...
- Consensus 달성 여부 체크 (70% 합의)
- Position distribution, average confidence 계산
- 라운드 종료 후 다음 라운드 자동 시작
- 동기적 실행 (모든 에이전트가 발언해야 다음 라운드)

### 사용자 경험
- 라운드 개념이 생소함
- 토론 진행이 느림 (라운드 대기)
- Reddit/Twitter 같은 친숙한 UI 없음

## 🎯 목표: Reddit 스타일

### 간단한 구조
```
예측 생성
  ↓
에이전트들이 자유롭게 발언 (비동기)
  ↓
시간순으로 스레드 형태 표시
  ↓
Cron에서 주기적으로 추가 발언
```

### 장점
✅ 개발 간단 (통계, consensus 제거)
✅ 친숙한 UX (Reddit/Twitter)
✅ 실시간성 (라운드 대기 없음)
✅ 자연스러운 토론 흐름

## 🔧 구현 전략

### Phase 1: Backend 간소화 (3-4h)

#### 1.1 새 함수: `createAgentArgument()` 생성
```typescript
// lib/agents/simple-debate.ts (새 파일)

/**
 * Reddit-style free-form debate
 * No rounds, no consensus, just free posting
 */

export async function createAgentArgument(
  predictionId: string,
  predictionData: {
    title: string
    description: string
    category?: string
    deadline: string
  },
  agentId: string
): Promise<ArgumentRow | null> {
  // 1. Get agent info
  // 2. Get existing arguments for context
  // 3. Execute agent to generate argument
  // 4. Save argument to DB (round_number = 1)
  // 5. Save ReAct cycle
  // Return argument or null if failed
}
```

#### 1.2 새 함수: `startFreeDebate()` 생성
```typescript
/**
 * Start debate with initial arguments from auto_participate agents
 * Reddit-style: all agents post immediately, no rounds
 */
export async function startFreeDebate(
  predictionId: string,
  predictionData: {...}
) {
  // 1. Get auto_participate agents
  // 2. Create simple debate_round record (round_number = 1, never ends)
  // 3. Execute all agents in parallel
  // 4. Save arguments
  // No consensus calculation, no round progression
}
```

#### 1.3 Cron 로직 수정
```typescript
// lib/agents/auto-debate-scheduler.ts

/**
 * Periodically have agents post new arguments
 * Each agent posts independently, no synchronization
 */
export async function executePeriodicDebateActivity() {
  // 1. Find active debates (predictions without resolution)
  // 2. For each debate:
  //    - Get eligible agents based on heartbeat schedule
  //    - Randomly select 1-3 agents to post
  //    - Create arguments via createAgentArgument()
  // 3. Return results
}
```

#### 1.4 예측 생성 시 자동 시작
```typescript
// app/api/predictions/route.ts

// After creating prediction
await startFreeDebate(predictionId, predictionData)
  .catch(err => console.error('Failed to start debate:', err))
```

### Phase 2: Frontend 변경 (2-3h)

#### 2.1 Arguments 표시 간소화
```typescript
// app/predictions/[id]/page.tsx

// 현재: 라운드별로 그룹화
arguments.filter(arg => arg.round_number === currentRound)

// 변경: 시간순으로 전체 표시
arguments.sort((a, b) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
)
```

#### 2.2 UI 레이아웃
- 라운드 구분 제거
- Reddit 스타일 카드 레이아웃
- 에이전트 아바타 + 이름 + 시간
- Position badge (YES/NO)
- Confidence 표시
- ReAct cycle 상세 (접기/펼치기)

### Phase 3: 테스트 (1-2h)

#### 3.1 기능 테스트
- [ ] 예측 생성 시 에이전트 자동 발언
- [ ] Cron 실행 시 주기적 발언
- [ ] Arguments 시간순 정렬
- [ ] ReAct cycle 표시

#### 3.2 UI 테스트
- [ ] 모바일 반응형
- [ ] 스크롤 성능
- [ ] Loading states

## 📊 제거/단순화 목록

### 완전 제거
- ❌ `executeDebateRound()` - 복잡한 라운드 실행 로직
- ❌ `determineContinuation()` - Consensus 체크
- ❌ `calculateConsensus()` - 통계 계산
- ❌ `endDebateRound()` - 라운드 종료 로직
- ❌ Frontend 라운드 navigation

### 단순화/무시
- `debate_rounds` 테이블 - 하나만 생성 (round_number = 1), 종료하지 않음
- `round_number` 컬럼 - 모두 1로 고정
- `consensus_score`, `position_distribution` - null로 유지

## ⏱️ 예상 소요 시간

- Backend 새 함수 작성: 2h
- Backend Cron 수정: 1h
- Frontend 라운드 제거: 1h
- Frontend Reddit UI: 2h
- 테스트: 1-2h

**총: 7-8시간 (약 1일)**

## 🚀 실행 순서

1. ✅ 계획 수립 (현재)
2. `lib/agents/simple-debate.ts` 생성
3. `auto-debate-scheduler.ts` 수정
4. `/app/api/predictions/route.ts` 수정
5. Frontend 라운드 제거
6. Frontend Reddit UI 구현
7. 테스트 및 버그 수정
8. Hourly schedule 설정
9. V1 출시

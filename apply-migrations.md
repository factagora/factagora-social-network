# DB 마이그레이션 적용 가이드

## 상황
5개의 새로운 마이그레이션이 있지만, **V1 핵심 기능은 이미 동작 중**입니다.

## 필요한 마이그레이션
1. `20260213_react_cycle_storage.sql` - ReAct cycle 저장 (agent_react_cycles 테이블)
2. `20260215_user_profile_system.sql` - User profile 시스템
3. `20260215_user_profiles_table_safe.sql` - User profiles 테이블
4. `20260216_add_evidence_gathered.sql` - Evidence 필드 추가
5. `20260216_add_execution_time_ms.sql` - Execution time 필드 추가

## V1 출시를 위한 우선순위 평가

### 🔴 P0 (필수)
- **없음** - 핵심 기능(예측, 투표, AI 토론)은 이미 작동 중

### 🟡 P1 (중요, 하지만 V1 출시 가능)
- `20260216_add_execution_time_ms.sql` - 성능 모니터링용
- `20260216_add_evidence_gathered.sql` - Evidence 추적용

### 🟢 P2 (V1.1로 연기 가능)
- `20260213_react_cycle_storage.sql` - ReAct UI를 위해 필요하지만, 기본 토론은 작동
- `20260215_user_profile_system.sql` - User profile 기능 (V1.1)
- `20260215_user_profiles_table_safe.sql` - User profile 테이블 (V1.1)

## 추천 전략

### Option A: 지금 적용 (1-2시간)
Supabase Dashboard → SQL Editor → 5개 파일 순서대로 실행

### Option B: 나중에 적용 (추천)
1. V1은 기존 테이블로 출시
2. ReAct UI는 API에서 arguments 테이블의 reasoning 필드 사용
3. User profile은 V1.1에서 구현
4. Migration은 V1 출시 후 점진적 적용

## 결정
**Option B 추천** - 시간 절약 (1-2h) + V1 핵심 기능에 집중

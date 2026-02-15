# Timeseries Data Strategy 기획

## 핵심 질문

Timeseries 예측을 생성할 때, **어떻게 과거 데이터를 확보할 것인가?**

---

## Option 1: 사용자 CSV 업로드

### 장점
- ✅ **유연성**: 사용자가 원하는 모든 데이터 예측 가능
- ✅ **데이터 유지 부담 없음**: Factagora가 데이터 관리 불필요
- ✅ **틈새 시장**: 특수한 비즈니스 데이터 예측 가능
- ✅ **사용자 데이터 소유권**: 민감한 비즈니스 데이터 유지

### 단점
- ❌ **데이터 품질 문제**:
  - 포맷 불일치 (날짜 형식, 컬럼명, 구분자)
  - 결측치, 이상치 처리 복잡
  - 주기 불일치 (일간, 주간, 월간 혼재)
- ❌ **보안/프라이버시**:
  - 업로드된 데이터 저장 및 관리
  - GDPR/개인정보 이슈
- ❌ **검증 어려움**:
  - 데이터 출처 불명확
  - 조작 가능성
  - 예측 정확도 평가 어려움
- ❌ **복잡한 UX**:
  - 파일 업로드 → 검증 → 에러 수정 → 재업로드
  - 일반 사용자 진입장벽 높음

### 구현 복잡도
- **고난도**: 파일 파싱, 검증, 정규화, 저장, 에러 처리
- **개발 시간**: 2-3주

---

## Option 2: Factagora 큐레이션 데이터

### 장점
- ✅ **높은 데이터 품질**:
  - 검증된 출처 (CoinGecko, Yahoo Finance, Alpha Vantage)
  - 일관된 포맷
  - 자동 업데이트
- ✅ **단순한 UX**:
  - 드롭다운에서 선택만
  - 즉시 예측 생성
  - 진입장벽 낮음
- ✅ **신뢰도 높음**:
  - 공식 API 데이터
  - 커뮤니티 검증 가능
  - 과거 예측 정확도 추적 가능
- ✅ **마케팅 효과**:
  - "Bitcoin 예측" → 검색 유입
  - 인기 자산 = 더 많은 참여
- ✅ **AI Agent 최적화**:
  - 깨끗한 데이터 = 더 나은 예측
  - 일관된 포맷 = 학습 용이

### 단점
- ❌ **제한된 선택지**:
  - Factagora가 제공하는 자산만
  - 틈새 데이터 예측 불가
- ❌ **유지 관리 필요**:
  - API 연동 관리
  - 데이터 업데이트
  - API 비용 (일부 유료)
- ❌ **의존성**:
  - 외부 API 장애 시 영향

### 구현 복잡도
- **중간**: API 연동, 스케줄러, 캐싱
- **개발 시간**: 1주

---

## Option 3: 하이브리드 (권장 ⭐)

### Phase 1: MVP - 큐레이션만 (2-4주)
1. 인기 자산 10-20개로 시작
2. 무료 API 활용
3. 빠른 시장 검증

### Phase 2: CSV 업로드 추가 (8-12주 후)
1. 사용자 피드백 수집 후
2. Premium 기능으로 제공
3. 엄격한 검증 로직

### 장점
- ✅ 빠른 출시 (Phase 1)
- ✅ 사용자 경험 최적화
- ✅ 점진적 확장

---

## 추천: Phase 1 큐레이션 데이터

### 1단계: 데이터 소스 선정

**무료 API (추천)**
| API | 데이터 | 제한 | 비용 |
|-----|--------|------|------|
| CoinGecko | 암호화폐 | 50 calls/min | 무료 |
| Yahoo Finance (yfinance) | 주식, ETF | Unlimited | 무료 |
| Alpha Vantage | 주식, Forex | 25 calls/day (무료) | $49.99/mo (premium) |
| FRED API | 경제 지표 | 120 calls/min | 무료 |

**초기 자산 리스트 (10-20개)**

**암호화폐** (CoinGecko):
- Bitcoin (BTC)
- Ethereum (ETH)
- Solana (SOL)
- Cardano (ADA)

**주식** (Yahoo Finance):
- Apple (AAPL)
- Tesla (TSLA)
- NVIDIA (NVDA)
- Microsoft (MSFT)
- Amazon (AMZN)
- Google (GOOGL)

**경제 지표** (FRED):
- S&P 500 Index
- Gold Price
- US 10Y Treasury
- Crude Oil (WTI)

**Forex**:
- USD/KRW
- EUR/USD

### 2단계: 데이터 구조

```typescript
// Database schema extension
interface TimeseriesDataSource {
  id: string
  symbol: string           // "BTC", "AAPL"
  name: string            // "Bitcoin", "Apple Inc."
  category: string        // "crypto", "stock", "commodity"
  api_source: string      // "coingecko", "yahoo"
  api_config: {
    endpoint: string
    params: Record<string, any>
  }
  update_frequency: string // "hourly", "daily"
  last_updated: string
  is_active: boolean
}

// Historical data cache
interface TimeseriesDataPoint {
  source_id: string
  timestamp: string
  value: number
  volume?: number
  metadata?: Record<string, any>
}
```

### 3단계: UX 플로우

**Prediction 생성 시**:
```
1. User: Timeseries 타입 선택
2. System: "Select an asset" 드롭다운 표시

   📊 Popular Assets
   ├─ 💰 Crypto
   │  ├─ Bitcoin (BTC)         $95,234  ↑ 2.4%
   │  ├─ Ethereum (ETH)        $3,456   ↑ 1.8%
   │  └─ Solana (SOL)          $145     ↓ 0.5%
   ├─ 📈 Stocks
   │  ├─ Apple (AAPL)          $178.23  ↑ 0.8%
   │  ├─ Tesla (TSLA)          $245.67  ↑ 3.2%
   │  └─ NVIDIA (NVDA)         $789.45  ↑ 5.1%
   └─ 🌍 Commodities
      ├─ Gold (XAU/USD)        $2,034   ↑ 0.3%
      └─ Crude Oil (WTI)       $76.45   ↓ 1.2%

3. User: 자산 선택 (예: Bitcoin)
4. System: 자동으로 채워짐
   - Asset: "Bitcoin"
   - Metric: "price"
   - Unit: "USD"
   - Historical data: 최근 1년 자동 로드

5. User: 예측 기간 선택
   - Start date: 2026-02-15 (현재)
   - End date: 2026-05-31
   - Interval: Daily / Weekly / Monthly

6. System: Prediction 생성 완료
```

### 4단계: 데이터 파이프라인

```typescript
// 1. Data Ingestion (매일 실행)
async function updateTimeseriesData() {
  for (const source of activeSources) {
    const data = await fetchFromAPI(source)
    await cacheData(source.id, data)
  }
}

// 2. Data Serving (예측 생성 시)
async function getHistoricalData(sourceId: string, dateRange: DateRange) {
  // Cache에서 조회
  const cached = await db.query(`
    SELECT * FROM timeseries_data
    WHERE source_id = $1
    AND timestamp BETWEEN $2 AND $3
    ORDER BY timestamp ASC
  `, [sourceId, dateRange.start, dateRange.end])

  return cached
}

// 3. Prediction Context (AI Agent에게 제공)
async function buildPredictionContext(predictionId: string) {
  const prediction = await getPrediction(predictionId)
  const historicalData = await getHistoricalData(
    prediction.timeseries_source_id,
    { start: oneYearAgo, end: now }
  )

  return {
    asset: prediction.asset,
    historical: historicalData,
    target_date: prediction.deadline,
    current_value: historicalData[historicalData.length - 1].value
  }
}
```

### 5단계: 비용 관리

**무료 티어 제한**:
- CoinGecko: 50 calls/min → 충분 (10개 자산 × 1일 1회 = 10 calls/day)
- Yahoo Finance: Unlimited → 완벽
- FRED: 120 calls/min → 충분

**캐싱 전략**:
- 일간 데이터: 1일 1회 업데이트 (매일 자정)
- 실시간 가격: 15분마다 업데이트 (표시용)
- 과거 데이터: 영구 캐싱 (변하지 않음)

**예상 비용**: $0/월 (무료 API만 사용)

---

## 구현 계획

### Sprint 1: 데이터 소스 설정 (2-3일)
- [ ] `timeseries_sources` 테이블 생성
- [ ] 초기 10개 자산 설정
- [ ] CoinGecko API 연동
- [ ] Yahoo Finance API 연동

### Sprint 2: 데이터 파이프라인 (3-4일)
- [ ] 일간 데이터 수집 스크립트
- [ ] `timeseries_data` 테이블 생성
- [ ] 캐싱 로직 구현
- [ ] Cron job 설정 (매일 자정)

### Sprint 3: UI 업데이트 (2-3일)
- [ ] 자산 선택 드롭다운
- [ ] 실시간 가격 표시
- [ ] 과거 데이터 미리보기 차트
- [ ] Form 자동 채우기

### Sprint 4: Prediction 생성 (2일)
- [ ] API 수정 (timeseries_source_id 추가)
- [ ] 과거 데이터 연동
- [ ] 검증 로직

**총 개발 시간**: 9-12일 (2주 Sprint)

---

## Phase 2: CSV 업로드 (추후)

### 언제 구현할까?
1. **사용자 요청이 많을 때**
   - "이 자산을 예측하고 싶은데 없어요"
   - 10+ 요청 누적 시

2. **큐레이션 자산이 충분할 때**
   - 50+ 자산 확보
   - 다양한 카테고리 커버

3. **Premium 기능으로 제공**
   - 무료: 큐레이션 자산만
   - Pro: CSV 업로드 가능

### CSV 업로드 기능 명세 (참고용)
```typescript
// Required CSV format
// date,value
// 2024-01-01,100.5
// 2024-01-02,101.2

interface CSVUploadValidation {
  minDataPoints: 30      // 최소 30일 데이터
  maxFileSize: 5MB
  requiredColumns: ["date", "value"]
  dateFormat: "YYYY-MM-DD"
  valueType: "number"
}
```

---

## 최종 추천: Curated Data First

**이유**:
1. ✅ **빠른 출시**: 2주면 완성
2. ✅ **높은 품질**: 검증된 데이터
3. ✅ **단순한 UX**: 선택만 하면 끝
4. ✅ **마케팅 효과**: "Bitcoin 예측" 키워드
5. ✅ **AI 최적화**: 깨끗한 데이터
6. ✅ **무료**: API 비용 $0

**다음 단계**:
1. Phase 1 구현 후 사용자 반응 관찰
2. 요청 많은 자산 우선 추가
3. 나중에 CSV 업로드 고려

**시작할까요?**
- Option A: 지금 바로 구현 시작
- Option B: 더 논의 후 결정

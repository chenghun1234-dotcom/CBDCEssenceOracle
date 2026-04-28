# GEPA API - Global Essence Price AI
## RapidAPI 등록 가이드

---

## 📋 RapidAPI 등록 정보

| 항목 | 내용 |
|------|------|
| **API 이름** | Global Essence Price AI (GEPA) |
| **카테고리** | Finance, Food, Data |
| **Base URL** | `https://gepa-api.YOUR_SUBDOMAIN.workers.dev` |
| **버전** | v1 |
| **인증 방식** | X-RapidAPI-Key (자동) |

---

## 🛠️ 배포 순서 (Step-by-Step)

### Step 1. Node.js 및 Wrangler 설치
```bash
# Node.js 18+ 설치 후
npm install -g wrangler
wrangler login
```

### Step 2. 프로젝트 의존성 설치
```bash
cd gepa-api
npm install
```

### Step 3. KV 네임스페이스 생성 (환율 캐싱용)
```bash
wrangler kv:namespace create GEPA_KV
# 출력된 id를 wrangler.toml의 id 필드에 입력

wrangler kv:namespace create GEPA_KV --preview
# 출력된 id를 wrangler.toml의 preview_id 필드에 입력
```

### Step 4. 환경 비밀값 설정
```bash
# RapidAPI 호스트 (나중에 RapidAPI에서 제공받음)
wrangler secret put RAPIDAPI_HOST
# 입력: gepa-api.p.rapidapi.com

# 개발용 비밀키 (로컬 테스트용)
wrangler secret put DEV_SECRET
# 입력: 원하는 임의의 비밀키
```

### Step 5. 로컬 테스트
```bash
wrangler dev
# → http://localhost:8787 에서 실행

# 별도 터미널에서 테스트
node tests/test.js
```

### Step 6. Cloudflare에 배포
```bash
wrangler deploy
# → https://gepa-api.YOUR_SUBDOMAIN.workers.dev 배포 완료
```

### Step 7. RapidAPI 등록

1. `https://rapidapi.com/studio`  접속
2. **"Add New API"** 클릭
3. 다음 정보 입력:
   - **API Name**: `Global Essence Price AI (GEPA)`
   - **Base URL**: `https://gepa-api.YOUR_SUBDOMAIN.workers.dev`
   - **Category**: Finance (+ Food 추가)
4. **Endpoints 추가**:
   - `GET /v1/market/prices`
   - `GET /v1/market/predict`
   - `POST /v1/settlement/calculate`
5. **Pricing Plans** 설정 (아래 참조)
6. **Publish** 클릭

---

## 💰 Freemium 플랜 설정

| 플랜 | 가격 | 일일 요청 | 기능 |
|------|------|-----------|------|
| **Basic** | 무료 | 50회 | 시세 조회 (15분 지연) |
| **Pro** | $29/월 | 5,000회 | 실시간 시세 + AI 예측 |
| **Ultra** | $99/월 | 50,000회 | 결제 계산 + SDK + 웹훅 |

---

## 📝 RapidAPI 설명란 (Copy-Paste용)

```
GEPA (Global Essence Price AI) is the world's first AI-powered 
global commodity price API with CBDC-native currency conversion.

KEY FEATURES:
✅ No USD conversion needed — direct CBDC-to-CBDC pricing
✅ AI supply/demand analysis for 13 global commodities
✅ Real-time logistics cost integration
✅ Buy/Sell signal generation with confidence scores
✅ CBDC settlement calculation with tariff & logistics

FORMULA: P_final = (P_origin + L_cost + E_adj) × R_cbdc

SUPPORTED CURRENCIES: KRW-C, USD-C, EUR-C, JPY-C, CNY-C, 
GBP-C, AUD-C, SGD-C, THB-C, BRL-C, INR-C, MYR-C

DATA SOURCES: USDA/AMS, FAO-FAOSTAT, EC-AGRI, 
Frankfurter (ECB), AGMARKNET

UPDATE FREQUENCY: Every 6 hours
```

---

## 🔗 API 엔드포인트 상세

### GET /v1/market/prices
```
Parameters:
  currency*   : KRW-C, USD-C, EUR-C, JPY-C...  (required)
  category    : meat | grain | vegetable | fruit | all
  item_id     : MEAT_BEEF_001, VEG_ONION_001...
  limit       : 1-50 (default: 20)
  lang        : ko | en (default: ko)

Example:
  GET /v1/market/prices?currency=KRW-C&category=meat
```

### GET /v1/market/predict
```
Parameters:
  item_id*    : MEAT_BEEF_001  (required)
  currency*   : KRW-C          (required)
  horizon     : 7d | 30d | both (default: both)

Example:
  GET /v1/market/predict?item_id=MEAT_BEEF_001&currency=KRW-C&horizon=both
```

### POST /v1/settlement/calculate
```
Body (JSON):
  item_id*        : "MEAT_BEEF_001"  (required)
  quantity*       : 500              (required)
  currency*       : "KRW-C"         (required)
  lock_rate       : true             (default: true)
  delivery_days   : 14               (default: 14)
  buyer_country   : "KR"            (default: KR)
  seller_country  : "AU"

Example:
  POST /v1/settlement/calculate
  {"item_id":"MEAT_BEEF_001","quantity":500,"currency":"KRW-C","lock_rate":true}
```

---

## 🏷️ 지원 품목 ID

| Category | Item ID | 품목 |
|----------|---------|------|
| meat | MEAT_BEEF_001 | 호주산 소고기 안심 |
| meat | MEAT_BEEF_002 | 미국산 소고기 등심 |
| meat | MEAT_PORK_001 | 미국산 돼지고기 삼겹 |
| meat | MEAT_PORK_002 | 스페인산 돼지고기 목살 |
| meat | MEAT_CHICKEN_001 | 브라질산 닭가슴살 |
| grain | GRAIN_RICE_001 | 태국산 쌀 장립종 |
| grain | GRAIN_WHEAT_001 | 우크라이나산 밀 |
| grain | GRAIN_CORN_001 | 미국산 옥수수 |
| vegetable | VEG_ONION_001 | 인도산 양파 |
| vegetable | VEG_POTATO_001 | 네덜란드산 감자 |
| vegetable | VEG_TOMATO_001 | 스페인산 토마토 |
| fruit | FRUIT_BANANA_001 | 필리핀산 바나나 |
| fruit | FRUIT_APPLE_001 | 미국산 사과 후지 |

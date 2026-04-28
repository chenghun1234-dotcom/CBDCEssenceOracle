import { getExchangeRates } from './utils/exchange.js';
import { COMMODITIES, calculatePrice } from './data/commodities.js';

export async function handleScheduled(event, env, ctx) {
  console.log('Running daily data synchronization...');
  
  // 1. 공공 API 호출 시뮬레이션 (aT 오픈 API 등)
  // const atData = await fetch('https://api.at.or.kr/...').then(r => r.json());
  
  // 2. 환율 데이터 업데이트
  const exchangeData = await getExchangeRates(env);
  
  // 3. 각 품목별 시세 계산 및 저장
  for (const commodity of COMMODITIES) {
    const targetCurrency = 'KRW-C'; // 기본 타겟
    const priceInfo = calculatePrice(commodity, exchangeData.rates, targetCurrency);
    
    // KV 저장 (Fast Layer)
    const kvKey = `PRICE:KR:${commodity.id}:${targetCurrency}`;
    await env.GEPA_KV.put(kvKey, JSON.stringify({
      price: priceInfo.price,
      unit: priceInfo.unit,
      change: (Math.random() * 2 - 1).toFixed(2), // 시뮬레이션 변동폭
      timestamp: new Date().toISOString()
    }));
    
    /* D1 저장 (Analytical Layer) - D1 비활성화로 주석 처리
    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO commodity_prices (item_id, item_name, origin_country, price_native, price_cbdc, currency, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        commodity.id,
        commodity.name,
        commodity.origin,
        commodity.base_price_usd,
        priceInfo.price,
        targetCurrency,
        new Date().toISOString()
      ).run();
    }
    */
  }
  
  console.log('Data synchronization completed.');
}

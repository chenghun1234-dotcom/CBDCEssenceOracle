import { getExchangeRates } from './utils/exchange.js';
import { fetchUSDAPrices } from './utils/usda.js';
import { fetchFAOIndex } from './utils/fao.js';

export async function handleScheduled(event, env, ctx) {
  console.log('Running global data synchronization (FAO, USDA, Frankfurter)...');
  
  // 1. 환율 데이터 가져오기 (Frankfurter)
  const exchangeInfo = await getExchangeRates(env);
  
  // 2. USDA 농산물 데이터 가져오기
  const usdaData = await fetchUSDAPrices(env.USDA_API_KEY);
  
  // 3. FAO 식품 지수 데이터 가져오기
  const faoData = await fetchFAOIndex();
  
  let currentPrices = await env.GEPA_KV.get("LATEST_PRICES", { type: "json" }) || [];
  
  // USDA 데이터 업데이트
  if (usdaData) {
    const index = currentPrices.findIndex(p => p.id === usdaData.id);
    if (index !== -1) {
      currentPrices[index] = { ...currentPrices[index], ...usdaData, updated_at: new Date().toISOString() };
    } else {
      currentPrices.push({ ...usdaData, updated_at: new Date().toISOString() });
    }
  }

  // 4. KV 저장 (Fast Layer)
  await env.GEPA_KV.put("LATEST_PRICES", JSON.stringify(currentPrices));
  if (faoData) {
    await env.GEPA_KV.put("FAO_INDEX", JSON.stringify(faoData));
  }

  // 5. D1 저장 (Analytical Layer)
  if (env.DB) {
    try {
      const timestamp = new Date().toISOString();
      
      // USDA 데이터 D1 기록
      if (usdaData) {
        await env.DB.prepare(`
          INSERT INTO commodity_prices (item_id, item_name, price_native, price_cbdc, currency, recorded_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          usdaData.id,
          usdaData.name,
          usdaData.price_upu, // 여기서는 기준가로 저장
          usdaData.price_upu, 
          'USD-C',
          timestamp
        ).run();
      }

      console.log('D1 synchronization completed.');
    } catch (e) {
      console.error('D1 Sync Error:', e);
    }
  }

  console.log('Global data synchronization finished.');
}

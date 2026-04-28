import { getExchangeRates } from './utils/exchange.js';
import { fetchUSDAPrices, SUPPORTED_USDA_COMMODITIES } from './utils/usda.js';
import { fetchFAOIndex } from './utils/fao.js';

export async function handleScheduled(event, env, ctx) {
  console.log('Running global data synchronization (FAO, USDA, Frankfurter)...');
  
  const apiKey = env.USDA_API_KEY;
  let currentPrices = await env.GEPA_KV.get("LATEST_PRICES", { type: "json" }) || [];
  const timestamp = new Date().toISOString();

  // 1. 환율 데이터 가져오기 (Frankfurter)
  const exchangeInfo = await getExchangeRates(env);
  
  // 2. USDA 농산물 데이터 가져오기 (다중 품목)
  console.log(`Fetching USDA data for: ${SUPPORTED_USDA_COMMODITIES.join(', ')}`);
  for (const symbol of SUPPORTED_USDA_COMMODITIES) {
    const usdaData = await fetchUSDAPrices(apiKey, symbol);
    
    if (usdaData) {
      const index = currentPrices.findIndex(p => p.id === usdaData.id);
      if (index !== -1) {
        currentPrices[index] = { ...currentPrices[index], ...usdaData };
      } else {
        currentPrices.push(usdaData);
      }

      // D1 저장 (Analytical Layer)
      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT INTO commodity_prices (item_id, item_name, price_native, price_cbdc, currency, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            usdaData.id,
            usdaData.name,
            usdaData.price_upu,
            usdaData.price_upu,
            'USD-C',
            timestamp
          ).run();
        } catch (e) {
          console.error(`D1 Sync Error for ${symbol}:`, e);
        }
      }
    }
  }
  
  // 3. FAO 식품 지수 데이터 가져오기
  const faoData = await fetchFAOIndex();
  
  // 4. KV 저장 (Fast Layer)
  await env.GEPA_KV.put("LATEST_PRICES", JSON.stringify(currentPrices));
  if (faoData) {
    await env.GEPA_KV.put("FAO_INDEX", JSON.stringify(faoData));
  }

  console.log('Global data synchronization finished.');
}

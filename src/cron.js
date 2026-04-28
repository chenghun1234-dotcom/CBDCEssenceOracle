import { getExchangeRates } from './utils/exchange.js';
import { fetchUSDAPrices } from './utils/usda.js';

export async function handleScheduled(event, env, ctx) {
  console.log('Running daily data synchronization with USDA...');
  
  const apiKey = env.USDA_API_KEY;
  const usdaData = await fetchUSDAPrices(apiKey);
  
  let currentPrices = await env.GEPA_KV.get("LATEST_PRICES", { type: "json" }) || [];
  
  if (usdaData) {
    // USDA 데이터로 기존 리스트 업데이트 또는 추가
    const index = currentPrices.findIndex(p => p.id === usdaData.id);
    if (index !== -1) {
      currentPrices[index] = { ...currentPrices[index], ...usdaData };
    } else {
      currentPrices.push(usdaData);
    }
    
    await env.GEPA_KV.put("LATEST_PRICES", JSON.stringify(currentPrices));
    console.log('USDA Data synchronized successfully.');
  }
}

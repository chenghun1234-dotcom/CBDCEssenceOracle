import { getExchangeRates } from './utils/exchange.js';

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'KRW-C';

    // 1. 환율 정보 가져오기 (Frankfurter API 활용)
    const exchangeInfo = await getExchangeRates(env);
    const rate = exchangeInfo.rates[currency] || 1350; // 환율 정보가 없으면 기본값 1350 사용

    // 2. KV에서 최신 데이터 가져오기 (없으면 빈 배열)
    let data = await env.GEPA_KV.get("LATEST_PRICES", { type: "json" }) || [];

    // 3. 필수 기본 품목 및 USDA 품목 정의 (English Localization)
    const defaultItems = [
      { id: "MEAT_BEEF", name: "Australian Beef Tenderloin", price_upu: 24.50, unit: "kg", trend: "up" },
      { id: "MEAT_PORK", name: "U.S. Pork Belly", price_upu: 12.20, unit: "kg", trend: "down" },
      { id: "VEG_ONION", name: "Domestic Fresh Onions", price_upu: 3.10, unit: "kg", trend: "stable" },
      { id: "FRUIT_APPLE", name: "Global Standard Fuji Apple", price_upu: 4.50, unit: "kg", trend: "up" },
      { id: "GRAIN_CORN", name: "USDA Standard Corn", price_upu: 0.18, unit: "kg", trend: "stable", source: "USDA QuickStats" },
      { id: "GRAIN_WHEAT", name: "USDA Standard Wheat", price_upu: 0.22, unit: "kg", trend: "stable", source: "USDA QuickStats" }
    ];

    // 기존 데이터 업데이트 또는 병합
    let isUpdated = false;
    for (const item of defaultItems) {
      const existingIndex = data.findIndex(existing => existing.id === item.id);
      if (existingIndex === -1) {
        data.push(item);
        isUpdated = true;
      } else {
        // 기존 데이터가 한국어일 경우 영어로 업데이트
        if (data[existingIndex].name !== item.name) {
          data[existingIndex] = { ...data[existingIndex], ...item };
          isUpdated = true;
        }
      }
    }

    if (isUpdated) {
      await env.GEPA_KV.put("LATEST_PRICES", JSON.stringify(data));
    }

    // 4. 실시간 환산 및 데이터 가공
    const finalData = data.map(item => ({
      ...item,
      local_price: Math.round(item.price_upu * rate),
      currency: currency,
      ai_insight: item.trend === "up" ? "Rising trend due to supply shortage" : "Supply remains stable"
    }));

    return new Response(JSON.stringify({
      status: "success",
      service: "CBDC Global Price AI",
      timestamp: new Date().toISOString(),
      base_currency: currency,
      exchange_source: exchangeInfo.source || "Default",
      data: finalData
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

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

    // 3. 필수 기본 품목 및 USDA 품목 정의
    const defaultItems = [
      { id: "MEAT_BEEF", name: "호주산 소고기 안심", price_upu: 24.50, unit: "kg", trend: "up" },
      { id: "MEAT_PORK", name: "미국산 돼지고기 삼겹", price_upu: 12.20, unit: "kg", trend: "down" },
      { id: "VEG_ONION", name: "국내산 햇양파", price_upu: 3.10, unit: "kg", trend: "stable" },
      { id: "FRUIT_APPLE", name: "글로벌 표준 부사", price_upu: 4.50, unit: "kg", trend: "up" },
      { id: "GRAIN_CORN", name: "USDA 표준 옥수수", price_upu: 0.18, unit: "kg", trend: "stable", source: "USDA QuickStats" },
      { id: "GRAIN_WHEAT", name: "USDA 표준 밀", price_upu: 0.22, unit: "kg", trend: "stable", source: "USDA QuickStats" }
    ];

    // 기존 데이터에 누락된 품목이 있으면 추가 (자동 병합)
    let isUpdated = false;
    for (const item of defaultItems) {
      if (!data.some(existing => existing.id === item.id)) {
        data.push(item);
        isUpdated = true;
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
      ai_insight: item.trend === "up" ? "공급량 감소로 상승세" : "수급 안정적"
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

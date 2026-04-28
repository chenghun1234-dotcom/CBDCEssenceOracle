export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'KRW-C'; // 기본값 KRW-C

    // 1. KV에서 데이터를 가져오기 (비어있으면 기본 데이터 생성)
    let data = await env.GEPA_KV.get("LATEST_PRICES", { type: "json" });

    if (!data) {
      // 초기 데이터 (공공데이터 API 연결 전까지 보여줄 고품질 샘플 데이터)
      data = [
        { id: "MEAT_BEEF", name: "호주산 소고기 안심", price_upu: 24.50, unit: "kg", trend: "up" },
        { id: "MEAT_PORK", name: "미국산 돼지고기 삼겹", price_upu: 12.20, unit: "kg", trend: "down" },
        { id: "VEG_ONION", name: "국내산 햇양파", price_upu: 3.10, unit: "kg", trend: "stable" },
        { id: "FRUIT_APPLE", name: "글로벌 표준 부사", price_upu: 4.50, unit: "kg", trend: "up" }
      ];
      // 첫 방문자를 위해 KV에 즉시 저장
      await env.GEPA_KV.put("LATEST_PRICES", JSON.stringify(data));
    }

    // 2. [AI-CBDC 로직] 요청한 통화에 맞춰 실시간 환산
    // (현재는 1 UPU = 1,350 KRW-C 로 단순화, 나중에 Frankfurter API 연결 가능)
    const rate = currency === 'KRW-C' ? 1350 : 1;
    
    const finalData = data.map(item => ({
      ...item,
      local_price: Math.round(item.price_upu * rate),
      currency: currency,
      ai_insight: item.trend === "up" ? "공급량 감소로 상승세" : "수급 안정적"
    }));

    // 3. 최종 JSON 응답
    return new Response(JSON.stringify({
      status: "success",
      service: "CBDC Global Price AI",
      timestamp: new Date().toISOString(),
      base_currency: currency,
      data: finalData
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // RapidAPI 연동을 위해 필수
      }
    });
  }
};

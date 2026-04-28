const FRANKFURTER_API = 'https://api.frankfurter.app/latest';

export const getExchangeRates = async (env) => {
  const cacheKey = 'exchange_rates_latest';
  
  // 1. KV 캐시 확인
  if (env.GEPA_KV) {
    const cached = await env.GEPA_KV.get(cacheKey);
    if (cached) {
      console.log('Using cached exchange rates');
      return JSON.parse(cached);
    }
  }

  try {
    // 2. Frankfurter API 호출 (ECB 기준 환율)
    const response = await fetch(`${FRANKFURTER_API}?from=USD`);
    const data = await response.json();
    
    // 3. CBDC 통화 단위 시뮬레이션 및 데이터 정리
    const rates = {
      ...data.rates,
      'USD': 1.0,
      'USD-C': 1.0,
      'KRW-C': data.rates.KRW || 1350.0,
      'EUR-C': data.rates.EUR || 0.92,
      'JPY-C': data.rates.JPY || 155.0,
      'CNY-C': data.rates.CNY || 7.24
    };

    const result = {
      base: 'USD',
      date: data.date,
      rates,
      source: 'Frankfurter (ECB)'
    };

    // 4. KV에 6시간 동안 저장
    if (env.GEPA_KV) {
      await env.GEPA_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 21600 });
    }

    return result;
  } catch (error) {
    console.error('Frankfurter API fetch error:', error);
    // Fallback
    return {
      base: 'USD',
      rates: { 'USD-C': 1.0, 'KRW-C': 1350.0, 'EUR-C': 0.92 }
    };
  }
};

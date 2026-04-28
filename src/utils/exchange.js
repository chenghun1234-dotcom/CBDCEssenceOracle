const FRANKFURTER_API = 'https://api.frankfurter.app/latest';

export const getExchangeRates = async (env) => {
  const cacheKey = 'exchange_rates_latest';
  
  // Try to get from KV first
  if (env.GEPA_KV) {
    const cached = await env.GEPA_KV.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  try {
    const response = await fetch(`${FRANKFURTER_API}?from=USD`);
    const data = await response.json();
    
    // Simulate CBDC rates (1:1 with fiat for this demo, or add slight premium)
    const rates = {
      ...data.rates,
      'USD': 1.0,
      'USD-C': 1.0,
      'KRW-C': data.rates.KRW || 1350.0,
      'EUR-C': data.rates.EUR || 0.92,
      'JPY-C': data.rates.JPY || 155.0,
      'CNY-C': data.rates.CNY || 7.24,
      'GBP-C': data.rates.GBP || 0.80,
      'AUD-C': data.rates.AUD || 1.52,
      'SGD-C': data.rates.SGD || 1.36,
      'THB-C': data.rates.THB || 37.0,
      'BRL-C': data.rates.BRL || 5.1,
      'INR-C': data.rates.INR || 83.5,
      'MYR-C': data.rates.MYR || 4.77
    };

    const result = {
      base: 'USD',
      date: data.date,
      rates
    };

    // Store in KV for 6 hours
    if (env.GEPA_KV) {
      await env.GEPA_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 21600 });
    }

    return result;
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    // Fallback rates
    return {
      base: 'USD',
      rates: { 'USD-C': 1.0, 'KRW-C': 1350.0, 'EUR-C': 0.92 }
    };
  }
};

export const convertCurrency = (amount, fromRate, toRate) => {
  return (amount / fromRate) * toRate;
};

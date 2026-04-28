export const COMMODITIES = [
  { id: 'MEAT_BEEF_001', name: '호주산 소고기 안심', category: 'meat', base_price_usd: 12.5, origin: 'AU' },
  { id: 'MEAT_BEEF_002', name: '미국산 소고기 등심', category: 'meat', base_price_usd: 15.0, origin: 'US' },
  { id: 'MEAT_PORK_001', name: '미국산 돼지고기 삼겹', category: 'meat', base_price_usd: 8.5, origin: 'US' },
  { id: 'MEAT_PORK_002', name: '스페인산 돼지고기 목살', category: 'meat', base_price_usd: 9.0, origin: 'ES' },
  { id: 'MEAT_CHICKEN_001', name: '브라질산 닭가슴살', category: 'meat', base_price_usd: 4.5, origin: 'BR' },
  { id: 'GRAIN_RICE_001', name: '태국산 쌀 장립종', category: 'grain', base_price_usd: 0.6, origin: 'TH' },
  { id: 'GRAIN_WHEAT_001', name: '우크라이나산 밀', category: 'grain', base_price_usd: 0.25, origin: 'UA' },
  { id: 'GRAIN_CORN_001', name: '미국산 옥수수', category: 'grain', base_price_usd: 0.18, origin: 'US' },
  { id: 'VEG_ONION_001', name: '인도산 양파', category: 'vegetable', base_price_usd: 0.4, origin: 'IN' },
  { id: 'VEG_POTATO_001', name: '네덜란드산 감자', category: 'vegetable', base_price_usd: 0.5, origin: 'NL' },
  { id: 'VEG_TOMATO_001', name: '스페인산 토마토', category: 'vegetable', base_price_usd: 1.2, origin: 'ES' },
  { id: 'FRUIT_BANANA_001', name: '필리핀산 바나나', category: 'fruit', base_price_usd: 0.8, origin: 'PH' },
  { id: 'FRUIT_APPLE_001', name: '미국산 사과 후지', category: 'fruit', base_price_usd: 2.5, origin: 'US' }
];

export const calculatePrice = (commodity, rates, targetCurrency) => {
  const basePrice = commodity.base_price_usd;
  const rate = rates[targetCurrency] || 1.0;
  
  // Random fluctuation for simulation (±2%)
  const fluctuation = 1 + (Math.random() * 0.04 - 0.02);
  const finalPrice = basePrice * rate * fluctuation;

  return {
    item_id: commodity.id,
    name: commodity.name,
    price: parseFloat(finalPrice.toFixed(2)),
    currency: targetCurrency,
    unit: 'kg',
    last_updated: new Date().toISOString()
  };
};

export const getAIAnalysis = (commodity) => {
  const trends = ['stable', 'rising', 'falling'];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  const confidence = (0.7 + Math.random() * 0.25).toFixed(2);
  
  return {
    trend,
    confidence: parseFloat(confidence),
    reason: trend === 'rising' ? 'Supply shortage due to weather' : trend === 'falling' ? 'Increased seasonal production' : 'Market equilibrium'
  };
};

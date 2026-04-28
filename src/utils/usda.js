/**
 * USDA QuickStats API Utility
 */

const COMMODITY_MAP = {
  'CORN': { id: 'GRAIN_CORN', name: 'USDA Standard Corn', unit_conv: 25.4 }, // BU to kg approx
  'WHEAT': { id: 'GRAIN_WHEAT', name: 'USDA Standard Wheat', unit_conv: 27.2 },
  'SOYBEANS': { id: 'GRAIN_SOYBEAN', name: 'USDA Standard Soybeans', unit_conv: 27.2 },
  'RICE': { id: 'GRAIN_RICE', name: 'USDA Standard Rice', unit_conv: 45.3 } // CWT to kg approx
};

export async function fetchUSDAPrices(apiKey, commoditySymbol = 'CORN') {
  const config = COMMODITY_MAP[commoditySymbol];
  if (!config) {
    console.error(`Unsupported commodity symbol: ${commoditySymbol}`);
    return null;
  }

  const baseUrl = 'https://quickstats.nass.usda.gov/api/api_GET/';
  const params = new URLSearchParams({
    key: apiKey,
    commodity_desc: commoditySymbol,
    statisticcat_desc: 'PRICE RECEIVED',
    freq_desc: 'MONTHLY',
    year__GE: '2023',
    format: 'JSON'
  });

  // 쌀의 경우 단위가 다를 수 있음
  if (commoditySymbol === 'RICE') {
    params.append('unit_desc', '$ / CWT');
  } else {
    params.append('unit_desc', '$ / BU');
  }

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // 가장 최근 데이터 추출 (보통 첫 번째 항목)
      const latest = data.data[0];
      const rawPrice = parseFloat(latest.Value.replace(/,/g, ''));
      
      return {
        id: config.id,
        name: config.name,
        price_upu: rawPrice / config.unit_conv,
        unit: "kg",
        trend: "stable",
        source: "USDA QuickStats",
        updated_at: new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error(`USDA API Fetch Error for ${commoditySymbol}:`, error);
    return null;
  }
}

export const SUPPORTED_USDA_COMMODITIES = Object.keys(COMMODITY_MAP);

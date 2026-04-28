/**
 * USDA QuickStats API Utility
 */

export async function fetchUSDAPrices(apiKey) {
  // 예시: 옥수수(CORN)의 최신 가격 데이터를 가져오는 쿼리
  // 실제 운영 시에는 더 구체적인 파라미터(sector, group, commodity 등)가 필요합니다.
  const baseUrl = 'https://quickstats.nass.usda.gov/api/api_GET/';
  const params = new URLSearchParams({
    key: apiKey,
    commodity_desc: 'CORN',
    statisticcat_desc: 'PRICE RECEIVED',
    unit_desc: '$ / BU',
    freq_desc: 'MONTHLY',
    year__GE: '2023',
    format: 'JSON'
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // 가장 최근 데이터 추출
      const latest = data.data[0];
      return {
        id: "GRAIN_CORN",
        name: "USDA 표준 옥수수",
        price_upu: parseFloat(latest.Value.replace(/,/g, '')) / 25.4, // BU 단위를 kg 단위로 대략적 변환
        unit: "kg",
        trend: "stable", // API 응답에 따라 로직 추가 가능
        source: "USDA QuickStats"
      };
    }
    return null;
  } catch (error) {
    console.error('USDA API Fetch Error:', error);
    return null;
  }
}

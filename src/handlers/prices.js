import { jsonResponse, errorResponse } from '../utils/response.js';
import { COMMODITIES, calculatePrice } from '../data/commodities.js';
import { getExchangeRates } from '../utils/exchange.js';

export const handlePrices = async (request, env) => {
  const url = new URL(request.url);
  const currency = url.searchParams.get('currency') || 'USD-C';
  const category = url.searchParams.get('category');
  const itemId = url.searchParams.get('item_id');
  const limit = parseInt(url.searchParams.get('limit')) || 20;

  const exchangeData = await getExchangeRates(env);
  const rates = exchangeData.rates;

  if (!rates[currency]) {
    return errorResponse(`Unsupported currency: ${currency}`);
  }

  let filtered = COMMODITIES;

  if (itemId) {
    filtered = filtered.filter(c => c.id === itemId);
  } else if (category && category !== 'all') {
    filtered = filtered.filter(c => c.category === category);
  }

  const prices = filtered.slice(0, limit).map(c => calculatePrice(c, rates, currency));

  return jsonResponse({
    count: prices.length,
    currency,
    timestamp: new Date().toISOString(),
    data: prices
  });
};

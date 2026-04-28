import { jsonResponse, errorResponse } from '../utils/response.js';
import { COMMODITIES, calculatePrice, getAIAnalysis } from '../data/commodities.js';
import { getExchangeRates } from '../utils/exchange.js';

export const handlePredict = async (request, env) => {
  const url = new URL(request.url);
  const itemId = url.searchParams.get('item_id');
  const currency = url.searchParams.get('currency') || 'USD-C';
  const horizon = url.searchParams.get('horizon') || 'both';

  if (!itemId) {
    return errorResponse('item_id is required');
  }

  const commodity = COMMODITIES.find(c => c.id === itemId);
  if (!commodity) {
    return errorResponse('Commodity not found');
  }

  const exchangeData = await getExchangeRates(env);
  const currentPriceObj = calculatePrice(commodity, exchangeData.rates, currency);
  const analysis = getAIAnalysis(commodity);

  // Simulate prediction logic
  const predictions = {};
  if (horizon === '7d' || horizon === 'both') {
    const factor = analysis.trend === 'rising' ? 1.02 : analysis.trend === 'falling' ? 0.98 : 1.0;
    predictions['7d'] = {
      price: parseFloat((currentPriceObj.price * factor).toFixed(2)),
      change_pct: analysis.trend === 'rising' ? 2.0 : analysis.trend === 'falling' ? -2.0 : 0.0
    };
  }
  
  if (horizon === '30d' || horizon === 'both') {
    const factor = analysis.trend === 'rising' ? 1.05 : analysis.trend === 'falling' ? 0.95 : 1.0;
    predictions['30d'] = {
      price: parseFloat((currentPriceObj.price * factor).toFixed(2)),
      change_pct: analysis.trend === 'rising' ? 5.0 : analysis.trend === 'falling' ? -5.0 : 0.0
    };
  }

  return jsonResponse({
    item_id: itemId,
    currency,
    current_price: currentPriceObj.price,
    analysis,
    predictions,
    timestamp: new Date().toISOString()
  });
};

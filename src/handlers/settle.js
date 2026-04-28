import { jsonResponse, errorResponse } from '../utils/response.js';
import { COMMODITIES, calculatePrice } from '../data/commodities.js';
import { getExchangeRates } from '../utils/exchange.js';

export const handleSettle = async (request, env) => {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    const { item_id, quantity, currency, buyer_country = 'KR' } = body;

    if (!item_id || !quantity || !currency) {
      return errorResponse('item_id, quantity, and currency are required');
    }

    const commodity = COMMODITIES.find(c => c.id === item_id);
    if (!commodity) {
      return errorResponse('Commodity not found');
    }

    const exchangeData = await getExchangeRates(env);
    const priceObj = calculatePrice(commodity, exchangeData.rates, currency);
    
    const baseAmount = priceObj.price * quantity;
    
    // Simulate logistics and tariffs
    const logisticsCost = baseAmount * 0.05; // 5% logistics
    const tariffRate = buyer_country === 'KR' ? 0.10 : 0.03; // Example tariff
    const tariffAmount = baseAmount * tariffRate;
    
    const totalAmount = baseAmount + logisticsCost + tariffAmount;

    return jsonResponse({
      summary: {
        item_id,
        quantity,
        currency,
        total_amount: parseFloat(totalAmount.toFixed(2))
      },
      breakdown: {
        base_price_unit: priceObj.price,
        subtotal: parseFloat(baseAmount.toFixed(2)),
        logistics: parseFloat(logisticsCost.toFixed(2)),
        tariff: parseFloat(tariffAmount.toFixed(2))
      },
      cbdc_info: {
        network: 'Global CBDC Bridge',
        status: 'Calculated',
        lock_rate: body.lock_rate !== false
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse('Invalid JSON body');
  }
};

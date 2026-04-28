import { jsonResponse } from '../utils/response.js';

export const handleHealth = async () => {
  return jsonResponse({
    status: 'ok',
    service: 'GEPA API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
};

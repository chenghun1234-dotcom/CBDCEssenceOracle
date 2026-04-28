import { Router } from 'itty-router';
import { verifyAuth } from './utils/auth.js';
import { errorResponse } from './utils/response.js';
import { handleHealth } from './handlers/health.js';
import { handlePrices } from './handlers/prices.js';
import { handlePredict } from './handlers/predict.js';
import { handleSettle } from './handlers/settle.js';

const router = Router();

// Middleware for authentication
const authMiddleware = (request, env) => {
  if (!verifyAuth(request, env)) {
    return errorResponse('Unauthorized: Missing or invalid RapidAPI Key', 401);
  }
};

// Routes
router.get('/', handleHealth);
router.get('/v1/market/prices', authMiddleware, handlePrices);
router.get('/v1/market/predict', authMiddleware, handlePredict);
router.post('/v1/settlement/calculate', authMiddleware, handleSettle);

// 404 handler
router.all('*', () => errorResponse('Endpoint not found', 404));

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};

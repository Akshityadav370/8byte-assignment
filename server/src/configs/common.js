import YahooFinance from 'yahoo-finance2';
import rateLimit from 'express-rate-limit';

export const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
});

export const portfolioLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 10,
  message: {
    success: false,
    error:
      'Too many requests. Portfolio data updates every 15 seconds. Please wait.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

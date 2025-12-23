import { Router } from 'express';
import { buildPortfolio } from '../controller/portfolio.service.js';
import { portfolioLimiter } from '../configs/common.js';

const router = Router();

router.get('/portfolio', portfolioLimiter, async (_req, res) => {
  try {
    const data = await buildPortfolio();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to build portfolio' });
  }
});

export default router;

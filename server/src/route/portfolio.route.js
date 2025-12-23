import { Router } from 'express';
import { buildPortfolio } from '../controller/portfolio.service.js';

const router = Router();

router.get('/portfolio', async (_req, res) => {
  try {
    const data = await buildPortfolio();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to build portfolio' });
  }
});

export default router;

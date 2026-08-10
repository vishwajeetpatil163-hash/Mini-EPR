import { Router } from 'express';
import { db } from '../db/database';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// GET /api/dashboard/stats
router.get('/stats', (_req, res, next) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;

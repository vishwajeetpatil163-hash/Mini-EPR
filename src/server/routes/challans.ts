import { Router, Response } from 'express';
import { db, ChallanStatus } from '../db/database';
import { authenticateJWT, requireRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// GET /api/challans
router.get('/', (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = (req.query.status as string) || '';
    const customerId = (req.query.customerId as string) || '';
    const q = (req.query.q as string) || '';

    const result = db.getChallans({ page, limit, status, customerId, q });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/challans/:id
router.get('/:id', (req, res, next) => {
  try {
    const challan = db.getChallanById(req.params.id);
    if (!challan) {
      return res.status(404).json({ error: 'NotFound', message: `Challan '${req.params.id}' not found.` });
    }
    res.json(challan);
  } catch (err) {
    next(err);
  }
});

// POST /api/challans
router.post('/', requireRoles(['ADMIN', 'SALES', 'ACCOUNTS']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { customerId, deliveryAddress, remarks, status, items } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'customerId and non-empty items array are required.',
      });
    }

    const createdBy = req.user?.name || 'Sales Rep';
    const newChallan = db.createChallan(
      {
        customerId,
        deliveryAddress,
        remarks,
        status: status as ChallanStatus,
        items,
      },
      createdBy
    );

    res.status(201).json({
      message: `Sales Challan ${newChallan.challanNumber} created successfully as ${newChallan.status}.`,
      challan: newChallan,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/challans/:id/confirm
router.patch(
  '/:id/confirm',
  requireRoles(['ADMIN', 'ACCOUNTS', 'WAREHOUSE']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const confirmedBy = req.user?.name || 'Staff User';
      const confirmedChallan = db.confirmChallan(req.params.id, confirmedBy);

      res.json({
        message: `Sales Challan ${confirmedChallan.challanNumber} confirmed and stock updated.`,
        challan: confirmedChallan,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/challans/:id/cancel
router.patch(
  '/:id/cancel',
  requireRoles(['ADMIN', 'SALES', 'ACCOUNTS']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const cancelledBy = req.user?.name || 'Staff User';
      const cancelledChallan = db.cancelChallan(req.params.id, cancelledBy);

      res.json({
        message: `Sales Challan ${cancelledChallan.challanNumber} cancelled successfully.`,
        challan: cancelledChallan,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

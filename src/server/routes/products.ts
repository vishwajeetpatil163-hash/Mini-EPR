import { Router, Response } from 'express';
import { db, MovementType } from '../db/database';
import { authenticateJWT, requireRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// GET /api/products/stock-movements/all (Global stock movement log)
router.get('/stock-movements/all', (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const result = db.getStockMovements({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products
router.get('/', (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const q = (req.query.q as string) || '';
    const lowStock = req.query.lowStock === 'true';

    const result = db.getProducts({ page, limit, q, lowStock });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', (req, res, next) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'NotFound', message: `Product with ID '${req.params.id}' not found.` });
    }
    const movements = db.getStockMovements({ productId: product.id });
    res.json({ ...product, movements: movements.items });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post('/', requireRoles(['ADMIN', 'WAREHOUSE']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, sku, category, unitPrice, currentStock, minStockAlert, warehouseLocation } = req.body;

    if (!name || !sku || !category || unitPrice === undefined || !warehouseLocation) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Name, SKU, category, unitPrice, and warehouseLocation are required.',
      });
    }

    const createdBy = req.user?.name || 'Warehouse Staff';
    const product = db.createProduct(
      {
        name,
        sku,
        category,
        unitPrice: Number(unitPrice),
        currentStock: Number(currentStock || 0),
        minStockAlert: Number(minStockAlert || 10),
        warehouseLocation,
      },
      createdBy
    );

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id
router.put('/:id', requireRoles(['ADMIN', 'WAREHOUSE']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updatedBy = req.user?.name || 'Staff User';
    const updated = db.updateProduct(req.params.id, req.body, updatedBy);
    if (!updated) {
      return res.status(404).json({ error: 'NotFound', message: `Product with ID '${req.params.id}' not found.` });
    }
    res.json({ message: 'Product updated successfully.', product: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'NotFound', message: `Product with ID '${req.params.id}' not found.` });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/stock-movements
router.post(
  '/:id/stock-movements',
  requireRoles(['ADMIN', 'WAREHOUSE']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { quantityChanged, movementType, reason } = req.body;

      if (!quantityChanged || !movementType || !reason) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'quantityChanged, movementType (IN|OUT), and reason are required.',
        });
      }

      if (!['IN', 'OUT'].includes(movementType)) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'movementType must be either "IN" or "OUT".',
        });
      }

      const createdBy = req.user?.name || 'Warehouse Staff';
      const sm = db.createStockMovement({
        productId: req.params.id,
        quantityChanged: Number(quantityChanged),
        movementType: movementType as MovementType,
        reason,
        createdBy,
      });

      const updatedProduct = db.getProductById(req.params.id);

      res.status(201).json({
        message: 'Stock movement recorded successfully.',
        stockMovement: sm,
        currentStock: updatedProduct?.currentStock,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/products/:id/stock-movements
router.get('/:id/stock-movements', (req, res, next) => {
  try {
    const result = db.getStockMovements({ productId: req.params.id });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
